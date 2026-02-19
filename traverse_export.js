// work in progress
// use official Firebase APIs and requests to fetch stuff

var Storage = {
  collectedCards: [],

  addTraverseCard(card) {
    this.collectedCards.push(card);
  },

  clearCollectedCards() {
    this.collectedCards.length = 0;
  },

  getProjectId() {
    return JSON.parse(localStorage.firebaseAuthUser).claims.aud;
  },

  getCurrentUser() {
    // list of courses in response.fields.purchasedCourses.valueArray.values
    return JSON.parse(localStorage.firebaseAuthUser).userData;
  }

};

var HTTP = {

  GET(url, accessToken) {
    return fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      }
    }).then( res => { return res.json() });
  },

  POST(url, body, accessToken) {
    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }).then( res => { return res.json() })
  }

};

var FirebaseAPI = {

  documentToJson(fields) {
    let result = {};
    for (let f in fields) {
        let key = f, value = fields[f],
            isDocumentType = ['stringValue', 'booleanValue', 'doubleValue',
                'integerValue', 'timestampValue', 'mapValue', 'arrayValue'].find(t => t === key);
        if (isDocumentType) {
            let item = ['booleanValue', 'doubleValue', 'integerValue', 'timestampValue']
                .find(t => t === key)
            if (item)
                return value;
            else if ('stringValue' == key)
                return value.replaceAll("&nbsp;"," ").replace(/\s\s+/g, ' ').trim();
            else if ('mapValue' == key)
                return this.documentToJson(value.fields || {});
            else if ('arrayValue' == key) {
                let list = value.values;
                return !!list ? list.map(l => this.documentToJson(l)) : [];
            }
        } else {
            result[key] = this.documentToJson(value)
        }
    }
    return result;
  },

  getFirebaseLocalStorageRows() {
    return new Promise(resolve => {
      var req = indexedDB.open("firebaseLocalStorageDb", 1);
      req.onsuccess = () => {
        var idb = req.result;
        var tx = idb.transaction("firebaseLocalStorage", "readonly");
        var store = tx.objectStore("firebaseLocalStorage");
        store.getAll().onsuccess = ev => resolve(ev.target.result);
        idb.close();
      };
      req.onerror = () => resolve([]);
    });
  },

  async getAccessToken() {
    let rows = await FirebaseAPI.getFirebaseLocalStorageRows();
    if(!rows || rows.length === 0) {
      throw new Error("Firebase auth not found, can not continue");
    }
    let accessToken = rows[0].value.stsTokenManager.accessToken;
    return { token: accessToken };
  },

  getCardById(cardId="65s80gfws6h3mxutznd8sfai") {
    // level 3: cb0oi60ba5sfkts9vgn8vsod    plain, not a lot of cards
    // level 10: 65s80gfws6h3mxutznd8sfai   (plain, only cards)  around 30 cards?

    // level 13: m0af76b71q37ppdce4hjnvgy   (has sentence deck somewhere, the cardId is "ovaxhc75pwtb63cllmjb2vpa": 24 random alphanums )
    //           sentences also have Ids that are 24 random alphanums
    //           30 cards, where one is a sentence deck

    // level 49: 563nbvhlhcw835cb6hl4yrw5   (deck within level49: 9iqtrodxseqqn0w29o2gw9pm)
    //           sentenceIds are also 24 random alphanums

    // some cardIds: "晚上" , "匚（PROP）",  "zhu-", easy peasy

    let projectId = Storage.getProjectId();
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/userNames/Mandarin_Blueprint/cards/${cardId}`;

    return new Promise(resolve => {
      FirebaseAPI.getAccessToken().then(
        tokenRes => {
          HTTP.GET(url, tokenRes.token).then( data => resolve(data) );
      });
    });
  },

  getManyCards(cardIds) {
    let cardIds = cardIds || ["口（PROP）"];
    let arrayValues = cardIds.map(obj => {return {"stringValue" : obj} });
    let projectId = Storage.getProjectId();
    let url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/userNames/Mandarin_Blueprint:runQuery`;

    let query = {
      "structuredQuery": {
        "from":[{"collectionId": "cards"}],
        "where":{
          "fieldFilter": {
            "field": {
              "fieldPath": "id"},    // maybe id instead of title?
              "op": "IN",
              "value": {"arrayValue": {"values": arrayValues}
            }
          }
        },
//        "orderBy":[{"field":{"fieldPath":"__name__"},"direction":"ASCENDING"}]   // don't really need ordering I guess?
      }
    }

    return new Promise(resolve => {
      FirebaseAPI.getAccessToken().then(
        tokenRes => {
          HTTP.POST(url, query, tokenRes.token).then( data => resolve(data) );
      });
    });
  },

  formatTraverseDeck(data) {
    let cards = [];
    let jsonDoc = this.documentToJson(data.fields);
    for (var cardName of jsonDoc.graphInfo.children) {
      cards.push({title: cardName.split("/")[2].trim(), id: cardName});
    }
    return {
      title: jsonDoc.title,
      topic: jsonDoc.topic,
      type: "deck",
      id: jsonDoc.id || jsonDoc.split("/")[jsonDoc.split("/").length-1],
      cards: cards,
      notes: jsonDoc.notes,
    }
  },

  formatTraverseCard(data) {
    let jsonDoc = this.documentToJson(data.fields);
    return {
      title: jsonDoc.title,
      topic: jsonDoc.topic,
      type: "card",
      publishedJourneys: jsonDoc.publishedJourneys,
      template: jsonDoc.template,
      id: jsonDoc.id,
      fields: jsonDoc.fields,
      notes: jsonDoc.notes
    }
  },

  formatTraverse(data) {
    let jsonDoc = this.documentToJson(data.fields);
    let cardType = "card";
    let deckItems = ["Level", "级 - Intermediate", "级 - 中级课程"];
    if (jsonDoc.id && jsonDoc.id.length == 24 && deckItems.find(x => jsonDoc.title.includes(x)) ) {
      return this.formatTraverseDeck(data);
    }
    return this.formatTraverseCard(data);
  }

};


var Collector = {

  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  collectLevelById(levelId) {
    // 
    // collects a complete level or desired subdeck with everything, all cards, all nested decks and their cards and so on lol!
    // TODO: recursive descent to make sure all nested decks and their cards are fetched
    //
    var data = {meta: {}, cards: [], subdecks: [], raw: []};

    return new Promise(resolve => {

      FirebaseAPI.getCardById(levelId).then( result => {
        data.meta = FirebaseAPI.formatTraverse(result);
        data.raw.push(result);
        return data;
      }).then(this.sleep(300))
        .then(data => {
        let cardsToFetch = data.meta.cards.map(o => o.title); // chunk these?
        // also handle when these cards are actually sub-decks (Intermediate+ and sentence decks after level 13)

        FirebaseAPI.getManyCards(cardsToFetch).then( cardsData => {
          data.raw.push(cardsData);

          cardsData.forEach(card => {
            let formattedCard = FirebaseAPI.formatTraverse(card.document);
            if (formattedCard.type == "card") {
              data.cards.push(formattedCard);
            } else {
              // TODO: recursively fetch the deck
              data.subdecks.push(formattedCard);
            }
          });

        });
      }).then(data => resolve(data) );
    });
  },

}


