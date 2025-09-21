// ==UserScript==
// @name         Traverse Export To Anki
// @description  Export open Traverse cards to Anki (character or sentence cards)
// @version      2.2.2
// @grant        unsafeWindow
// @grant        GM.setValue
// @grant        GM.getValue
// @match        https://traverse.link/*
// ==/UserScript==

(function() {
  var STAGED_CARD = {};

  function GM_addStyle(css) {
     const style = document.getElementById("GM_addStyleByTravExport") || (function() {
      const style = document.createElement('style');
      style.type = 'text/css';
      style.id = "GM_addStyleByTravExport";
      document.head.appendChild(style);
      return style;
    })();
    const sheet = style.sheet;
    sheet.insertRule(css, (sheet.rules || sheet.cssRules || []).length);
  };

  GM_addStyle(".dropbtn { color: black; padding: 16px; font-size: 16px; border: none; cursor: pointer; }");
  GM_addStyle(".dropbtn:hover { background-color: #ddd; }");
  GM_addStyle(".dropdown { float: right; position: relative; display: inline-block; }");
  GM_addStyle(".dropdown-content { display: none; position: absolute; background-color: #f1f1f1; min-width: 200px; overflow: auto; box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2); right: 0; z-index: 1; }");
  GM_addStyle(".dropdown-content a { color: black; padding: 12px 16px; text-decoration: none; display: block; cursor: pointer; }");
  GM_addStyle(".dropdown a:hover {background-color: #ddd; }");
  GM_addStyle(".show {display: block;}");

  function createElement(elmtype, elmid, elmclass, elmstyle, elmtext) {
    var elm = document.createElement(elmtype);
    if (elmid) { elm.setAttribute("id", elmid); }
    elm.setAttribute("class", elmclass);
    if (elmstyle) { elm.setAttribute("style", elmstyle); }
    if (elmtext) { elm.textContent = elmtext; }
    return elm
  };

  var ANKI = {
    DEFAULTS: {
      MOVIE: {DECK: "Mining", MODEL: "Character Note", TAG: "4-MAKE-A-MOVIE"},
      PROP: {DECK: "Mining", MODEL: "PROP REVIEW", TAG: "1-PROPS"},
      SET: {DECK: "Mining", MODEL: "SET REVIEW", TAG: "3-SETS"},
      ACTOR: {DECK: "Mining", MODEL: "ACTOR REVIEW", TAG: "2-ACTORS"},
      WORDCONNECTION: {DECK: "Mining", MODEL: "WORD CONNECTION REVIEW", TAG: "5-UNLOCKED-VOCAB"},
      CONVOCON: {DECK: "Conversation Connectors", MODEL: "MB CONVOCON REVIEW", TAG: "MB_CONVO_CON"},
      SENTENCE: {DECK: "Mining Sentences", MODEL: "MB Cloze", TAG: "SENTENCE"}
    },

    options: {
      "allowDuplicate": true,
      "duplicateScope": "deck",
      "duplicateScopeOptions": {
        "deckName": "Default",
        "checkChildren": false,
        "checkAllModels": false
      }
    },

    generateUID: function() {
        var firstPart = (Math.random() * 466566) | 0;
        var secondPart = (Math.random() * 466566) | 0;
        firstPart = ("00000" + firstPart.toString(36)).slice(-5);
        secondPart = ("00000" + secondPart.toString(36)).slice(-5);
        return firstPart + secondPart;
    },
    
    createSentence: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("sentenceDeck") || this.DEFAULTS.SENTENCE.DECK;
      var pictures = [];
      var audio_fields = [];
      var modelName = ANKI.DEFAULTS.SENTENCE.MODEL;
      var noteTag = "SENTENCE";
      var tags = card['tags'];
      tags.push(noteTag);

      var notes = `Usages: <br/>
${card["usage"].join("<br/>")}<br/><br/>
Characters: <br/>
${card["characters"].join("<br/>")}<br/>
Personal Notes: <br/>
${card["notes"].join("<br/>")}
`;
      var fields = {
        "Sentence": card["hanzi"],
        "English": card["keyword"],
        "Notes": notes
      }

      if (card["word"]) {
        //var cloze = card["word"].replace(card["characters"][0], `{{c1::${card["characters"][0]}}}`);
        var cloze = card["word"].replace(card["characters"][0], `${card["characters"][0]}`); // fake cloze
        fields["Sentence"] = fields["Sentence"].replace(card["word"], `<span style="background-color: rgb(90, 131, 0);">${cloze}</span>`);
        fields["Sentence"] += "{{c1::}}";
      }
      fields["Top-Down Words"] = `${card["top-down"].join("<br/>")}`;
      card["audio"].forEach(a => {
        var split_fields = a.split("/");
        var filename = split_fields[split_fields.length-1];
        if (filename.length > 36) {
          filename = tags[0] + "-" + this.generateUID(filename)+'.mp3';
        }
        audio_fields.push({
          "url": a,
          "filename": filename,
          "skipHash": "",
          "fields": ["Audio"]
        })
      });

      var params = {
        "note": {
            "deckName": targetDeck,
            "modelName": modelName,
            "fields": fields,
            "options": this.options,
            "tags": tags,
            "audio": audio_fields,
            "picture": pictures
        }
      }
      return params;
    },
    
    createProp: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || ANKI.DEFAULTS.PROP.DECK;
      var tags = card['tags'];
      var prop = `${card["notes"].join("<br/>")}`;
      var fields = {
        COMPONENT: card["component"] || "empty",
        PROP: prop || "()",
        "SOURCE LESSON": card["source lesson"] || "",
      };
      var modelName = ANKI.DEFAULTS.PROP.MODEL;
      var noteTag = "1-PROPS";
      tags.push(noteTag);

      var params = {
        "note": {
            "deckName": targetDeck,
            "modelName": modelName,
            "fields": fields,
            "options": this.options,
            "tags": tags,
            "audio": [],
            "picture": []
        }
      }
      return params;
    },
    
    createSet: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || ANKI.DEFAULTS.SET.DECK;
      var tags = card['tags'];
      var set = `${card["notes"].join("<br/>")}`;
      var fields = {
        "PINYIN FINAL": card["pinyinfinal"],
        SET: set || "()",
        "SOURCE LESSON": card["source lesson"] || "",
      };
      var modelName = ANKI.DEFAULTS.SET.MODEL;
      var noteTag = "3-SETS";
      tags.push(noteTag);

      var params = {
        "note": {
            "deckName": targetDeck,
            "modelName": modelName,
            "fields": fields,
            "options": this.options,
            "tags": tags,
            "audio": [],
            "picture": []
        }
      }
      return params;
    },
    
    createActor: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || ANKI.DEFAULTS.ACTOR.DECK;
      var tags = card['tags'];
      var actor = `${card["notes"].join("<br/>")}`;
      var fields = {
        "PINYIN INITIAL": card["pinyininitial"],
        ACTOR: actor || "()",
        "SOURCE LESSON": card["source lesson"] || "",
      };
      var modelName = ANKI.DEFAULTS.ACTOR.MODEL;
      var noteTag = "2-ACTORS";
      tags.push(noteTag);

      var params = {
        "note": {
            "deckName": targetDeck,
            "modelName": modelName,
            "fields": fields,
            "options": this.options,
            "tags": tags,
            "audio": [],
            "picture": []
        }
      }
      return params;
    },
    
    createWordConnection: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || ANKI.DEFAULTS.WORDCONNECTION.DECK;
      var tags = card['tags'];
      var livedexperience = `${card["notes"].join("<br/>")}`;
      var audio_fields = [];
      var fields = {
        WORD: card["hanzi"],
        PINYIN: card["pinyin"],
        MEANING: card["keyword"],
        IMAGE: "()",
        "LIVED EXPERIENCE": livedexperience,
        "SOURCE LESSON": card["source lesson"] || "",
      };
      var modelName = ANKI.DEFAULTS.WORDCONNECTION.MODEL;
      var noteTag = ANKI.DEFAULTS.WORDCONNECTION.TAG;
      tags.push(noteTag);

      card["audio"].forEach(a => {
        var split_fields = a.split("/");
        var filename = split_fields[split_fields.length-1];
        audio_fields.push({
          "url": a,
          "filename": filename,
          "skipHash": "",
          "fields": ["AUDIO"]
        })
      });
      var params = {
        "note": {
            "deckName": targetDeck,
            "modelName": modelName,
            "fields": fields,
            "options": this.options,
            "tags": tags,
            "audio": audio_fields,
            "picture": []
        }
      }
      return params;
    },

    createCharacter: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || ANKI.DEFAULTS.MOVIE.DECK;
      var modelName = ANKI.DEFAULTS.MOVIE.MODEL;
      var noteTag = "4-MAKE-A-MOVIE";
      var tags = card['tags'];
      var audio_fields = [];
      var pictures = [];
      tags.push(noteTag);

      var notes = `
${card["notes"].join("<br/>")}
`;

      var fields = {
        "HANZI": card["hanzi"],
        "KEYWORD": card["keyword"],
        "PINYIN": card["pinyin"],
        "ACTOR": card["actor"],
        "SET": card["set"],
        "PROPS": `${card["props"].join("<br/>")}`,
        "NOTES": notes,
        "SOURCE LESSON": card["source lesson"] || "",
      }
      if (card["sentence"]) {
        fields["SENTENCE"] = card["sentence"];
      }

      var image_url = `https://dragonmandarin.com/media/hanzi5-${card["hanzi"]}.gif`
      var image_filename = `hanzi5-${card["hanzi"]}.gif`;
      pictures.push({
        "url": image_url,
        "filename": image_filename,
        "skipHash": "",
        "fields": [
          "STROKE ORDER"
        ]
      });

      if (card["sentence_word_usage"]) {
        fields["SENTENCE_WORD"] = card["sentence_word_usage"].map(usage => usage.split("-")[1].trim()).join(", ");
      }
      
      if (card["word"]) {
        if (card["word_pinyin"]) {
          fields["WORD_PINYIN"] = card["word_pinyin"];
          fields["SENTENCE"] = fields["SENTENCE"].replace(card["word"], `<span style="background-color: rgb(90, 131, 0);">${card["word"]}</span>`);
        }
      }

      card["audio"].forEach(a => {
        var split_fields = a.split("/");
        var filename = split_fields[split_fields.length-1];
        audio_fields.push({
          "url": a,
          "filename": filename,
          "skipHash": "",
          "fields": ["AUDIO"]
        })
      });

      card["sentence_audio"].forEach(a => {
        var split_fields = a.split("/");
        var filename = split_fields[split_fields.length-1];
        if (filename.length > 36) {
          filename = tags[0] + "-" + this.generateUID(filename)+'.mp3';
        }
        audio_fields.push({
          "url": a,
          "filename": filename,
          "skipHash": "",
          "fields": ["SENTENCE_AUDIO"]
        })
      });
      
      var params = {
        "note": {
            "deckName": targetDeck,
            "modelName": modelName,
            "fields": fields,
            "options": this.options,
            "tags": tags,
            "audio": audio_fields,
            "picture": pictures
        }
      }
      return params;

    },
    
    createConvoConnector: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("convoDeck") || "Conversation Connectors";
      var modelName = "MB CONVOCON REVIEW";
      var tags = card['tags'];
      var noteTag = "MB_CONVO_CON";
      var audio_fields = [];
      tags.push(noteTag);

      var notes = "";
      var pictures = [];

      var fields = {
        PHRASE_CHINESE: card["chinesePhrase"],
        PHRASE_ENG: card["englishPhrase"],
        PINYIN: card["pinyin"],
        NOTES: "",
      };

      card["audio"].forEach(a => {
        var split_fields = a.split("/");
        var filename = split_fields[split_fields.length-1];
        if (filename.length > 36) {
          filename = "convo_con-" + this.generateUID(filename)+'.mp3';
        }
        audio_fields.push({
          "url": a,
          "filename": filename,
          "skipHash": "",
          "fields": ["AUDIO"]
        })
      });

      var params = {
        "note": {
            "deckName": targetDeck,
            "modelName": modelName,
            "fields": fields,
            "options": this.options,
            "tags": tags,
            "audio": audio_fields,
            "picture": pictures
        }
      }
      return params;
    },
    
    createAnkiNote: function(card) {
      var note;
      if (card["type"] == "convo_connector") {
        note = this.createConvoConnector(card);
      }
      else if (card["type"] == "sentence") {
        note = this.createSentence(card);
      }
      else if (card["type"] == "movie review") {
        note = this.createCharacter(card);
      }
      else if (card["type"] == "prop") {
        note = this.createProp(card);
      }
      else if (card["type"] == "set") {
        note = this.createSet(card);
      }
      else if (card["type"] == "actor") {
        note = this.createActor(card);
      }
      else if (card["type"] == "wordconnection") {
        note = this.createWordConnection(card);
      } else {
        console.log("unknown card type, this will go bad");
      }

      if (note) {
        console.log(card);
        console.log(note);
        return this.anki_invoke('addNote', 6, note).then(result => { UI.createFlash("Added!"); });
      } else {
        console.error("could not create note, type not recognized");
      }
    },

    anki_invoke: function(action, version, params={}) {
      return new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.addEventListener('error', () => reject('failed to issue request'));
          xhr.addEventListener('load', () => {
              try {
                  const response = JSON.parse(xhr.responseText);
                  if (Object.getOwnPropertyNames(response).length != 2) {
                      throw 'response has an unexpected number of fields';
                  }
                  if (!response.hasOwnProperty('error')) {
                      throw 'response is missing required error field';
                  }
                  if (!response.hasOwnProperty('result')) {
                      throw 'response is missing required result field';
                  }
                  if (response.error) {
                      throw response.error;
                  }
                  resolve(response.result);
              } catch (e) {
                  reject(e);
              }
          });

          xhr.open('POST', 'http://127.0.0.1:8765');
          xhr.send(JSON.stringify({action, version, params}));
      });
    }

  };

  var Traverse = {
    attachCardType: function(card, children) {
      for (var idx=0; idx<children.length; idx++) {
        var child = children[idx];
        console.log(idx, child);
        if (child.textContent.startsWith("Movie review")) {
          card['type'] = 'movie review';
          card['hanzi'] = child.textContent.split("Movie review:")[1].trim();
          return;
        }
        if (child.textContent.startsWith("Pick a prop")) {
          card['type'] = 'prop';
          card['hanzi'] = child.textContent.split("Pick a prop for")[1].trim();
          return;
        }
        if (child.textContent.startsWith("Pick a set for")) {
          card['type'] = 'set';
          return;
        }
        if (child.textContent.startsWith("Pick an actor for")) {
          card['type'] = 'actor';
          return;
        }
        if (child.textContent.startsWith("Word:") || child.textContent.startsWith("Word connection:")) {
          card['type'] = 'wordconnection';
          return;
        }
        if ((child.textContent.startsWith("Characters:") || child.textContent.startsWith("Sentence"))) {
          var toplevel_h2 = child.parentNode.getElementsByTagName("H2");
          if (toplevel_h2[0].getElementsByClassName("highlight-review").length == 1){
            card['type'] = 'sentence';
          } else {
            card['type'] = 'sentence_production';
          }            
          return;
        }
        if (child.textContent.startsWith("Add to reviews")) {
          card["type"] = "convo_connector";
          return;
        }
        if (child.textContent.indexOf("Phrase #") >= 0) {
          card["type"] = "MSLK";
          return;
        }
      }
    },

    parseConvoConnector: function(children) {
      var card = {
        type: "convo_connector",
        englishPhrase: "",
        chinesePhrase: "",
        pinyin: "",
        audio: [],
        tags: [],
        notes: [],
      };
      for (var idx in children) {
        idx = parseInt(idx);
        var child = children[idx];

        if (child.textContent.startsWith("English phrase:")) {
          card["englishPhrase"] = children[idx+1].textContent.trim();
        }
        else if (child.textContent.startsWith("Chinese phrase:")) {
          card["chinesePhrase"] = children[idx+1].textContent.trim();
          card["pinyin"] = children[idx+2].textContent.replace("Your browser does not support the audio element.", "").trim();
        }
        else {
          this.attachAudio(card, child);
        }
      }
      console.log(card);
      return card;
    },
    
    parseMSLK: function(children) {
      var card = {
        type: "MSLK",
        englishPhrase: "",
        chinesePhrase: "",
        pinyin: "",
        audio: [],
        tags: ["MSLK"],
        notes: [],
      };
      for (var idx in children) {
        idx = parseInt(idx);
        var child = children[idx];

        if (child.textContent.startsWith("English")) {
          card["englishPhrase"] = children[idx+1].textContent.replace("Your browser does not support the audio element.", "").trim();
        }
        else if (child.textContent.startsWith("Chinese")) {
          card["pinyin"] = children[idx+1].textContent.replace("Your browser does not support the audio element.", "").trim();
          var phrase = children[idx+2].textContent.replace("Your browser does not support the audio element.", "").trim()
          if (phrase.indexOf("Phrase #")) {
            var phraseNum = phrase.split("Phrase #")[1].trim();
            var phrase = phrase.split("Phrase #")[0].trim();
            card["tags"].push(`Phrase#${phraseNum}`);
          }
          card["chinesePhrase"] = phrase;
        }
        else if (child.textContent.startsWith("Phrase #")) {
          var phraseNum = phrase.split("Phrase #")[1].trim();
          card["tags"].push(`Phrase#${phraseNum}`);
        }
        else {
          this.attachAudio(card, child);
        }
      }
      console.log("MSLK", card);
      return card;
    },
    
    parseTraverseCard: function() {
      var htmlchildren = document.getElementsByClassName("ProseMirror")[0].children;
      var children = [];
      for (var child of htmlchildren) {
        if (!child.textContent) { continue }
        children.push(child);
      }

      var card = {
        'type': null,
        'hanzi': null,
        'keyword': null,
        'pinyin': null,
        'audio': [],
        'sentence_audio': [],  // compat. Used in editor mode
        'sentence': null,      // compat. Used in editor mode
        'sentence_word': null,
        'actor': null,
        'set': null,
        'final': null,
        'props': [],
        'notes': [],
        'usage': [],
        'characters': [],
        'source lesson': null,
        'component': null,     // for prop cards
        'tags': [],
        'top-down': [],
        'word': "",
      };

      this.attachCardType(card, children);
      if (!card['type']) {
        console.log("could not identify card type, sorry");
        return;
      }
      console.debug(card);
      try {
        var document_level = document.getElementsByClassName("max-h-full")[0].textContent.match(/\d+/)[0];
        var level_tag = "MBMLEVEL"+document_level;
        card['tags'].push(level_tag);
      } catch { ; };

      if (card["type"] == "movie review") { card = this.parseMovie(card, children); }
      if (card["type"] == "sentence") { card = this.parseSentence(card, children); }
      if (card["type"] == "sentence_production") { card = this.parseSentenceProduction(card, children); }
      if (card["type"] == "prop") { card = this.parseProp(card, children); }
      if (card["type"] == "set") { card = this.parseSet(card, children); }
      if (card["type"] == "actor") { card = this.parseActor(card, children); }
      if (card["type"] == "wordconnection") { card = this.parseWordConnection(card, children); }
      if (card["type"] == "convo_connector") { card = this.parseConvoConnector(children); }
      if (card["type"] == "MSLK") { card = this.parseMSLK(children); }
      return card
    },

    parseTraverseAndAdd: function() {
      var card = Traverse.parseTraverseCard();
      if (["movie review", "sentence", "prop", "set", "actor", "wordconnection", "convo_connector"].indexOf(card["type"]) >= 0) {
        ANKI.createAnkiNote(card);
      }
    },

    automateLevel: function() {
      var delaySeconds = 12;
      function doit(elms) {
        Traverse.parseTraverseAndAdd(); // collect open card

        console.log(elms[0]);
        if (elms.length == 0 || elms[0].textContent.indexOf("CLICK HERE") >= 0 || elms[0].textContent.indexOf("LEVEL") >= 0 || elms[0].textContent.indexOf("句子") >= 0) {
          console.log("no more elements to add, level done?");
          UI.createFlash("Level/segment done!", 5000);
          return; // done!
        }
        console.log(`${elms.length} elements remaining, about ${elms.length * delaySeconds} seconds (${elms.length * delaySeconds / 60} minutes)`);
        elm = elms[0];
        elms = elms.slice(1,elms.length);
        elm.click();
        console.debug("clicked");
        window.setTimeout(
          (elms) => {
            doit(elms)
          },
          delaySeconds * 1000,
          elms);
      }

      var elms = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"));
      elms = elms.slice(1, elms.length);  // first element is the level header/item

      UI.createFlash("Beginning automation, hold on!", 4000);
      var selectedStyle = "(0, 148, 255)";
      var idx = 0;
      for (idx in elms) {
        console.log(idx);
        var elm = elms[idx];
        console.log(elm.parentNode.parentNode.style['border-color']);
        if (elm.parentNode.parentNode.style['border-color'].split(" rgb")[2] == selectedStyle) {
          console.log(`current selected element position: idx: ${idx}: ${elm.textContent}`);
          break;
        }
      }
      elms = elms.slice(idx, elms.length); // slice the elms to progress from current selected item
      console.log(elms);
      elms[0].click(); // click the first real card element
      elms = elms.slice(1, elms.length);
      window.setTimeout(
        (elms) => {
          doit(elms)
        },
        5000,
        elms);
    },
    
    attachNotes: function(card) {
      var edit_fields = document.getElementsByClassName("group/editor")
      for (var elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("notes") > 0) {
          var textValue = elm.textContent;
          // detect a href
          var a_href = elm.getElementsByTagName("a");
          if (a_href.length > 0) {
            a_href = a_href[0];
            if (a_href.textContent == "Source Video Lesson") {
              card["source lesson"] = `<a href="${a_href.getAttribute('href')}">source lesson</a>`;
              textValue = textValue.replace('Source Video Lesson', '');
            }
          }
          if (textValue.length > 0) {
            card['notes'].push(textValue);
          }
        }
      }
    },

    attachAudio: function(card, child) {
      var audio_elms = child.getElementsByTagName('audio');
      for (var elm of audio_elms) {
        if (!elm.textContent) { continue; }
        card['audio'].push(elm.getAttribute('src'));
      }
    },

    parseSentence: function(card, children) {
      for (var idx in children) {
        var idx = parseInt(idx);
        var child = children[idx];
        if (child.tagName == "P" && child.textContent.length > 3 && child.children.length == 0) {
          if (child.textContent.indexOf("用法") >= 0) {
            card["usage"].push(child.textContent);
          } else {
            if (child.textContent != card["keyword"]) { 
              card['top-down'].push(child.textContent);
            }
          }
        }

        if (child.tagName == "H2" && idx == 0) {
          card["hanzi"] = child.textContent;
          if (child.parentNode.getElementsByTagName("H2")[1].textContent == "") { // there is no translation!
            card["keyword"] = children[idx+1].textContent; // the next element is usually cloze keyword            
          } else {
            card["english"] = children[idx+1].textContent;
            card["keyword"] = children[idx+2].textContent; // the next element is usually cloze keyword
          }
          var mark_elm = child.getElementsByTagName("mark")[0];
          if (mark_elm != undefined) {
            card["word"] = mark_elm.textContent;
          }
        }
        
        else if (child.textContent.startsWith("Characters:")) {
          for (var propelm of child.children) {
            if (!propelm.textContent || propelm.textContent == "Characters:") { continue }
            var textContent = propelm.textContent.trim();
            if (textContent == "Untitled") {
              var splits = propelm.getElementsByTagName('a')[0].getAttribute("href").split("/");
              textContent = splits[splits.length-1];
            }
            card['characters'].push(textContent);
          }
        }
        else {
          this.attachAudio(card, child);
        }
      }
      this.attachNotes(card);
      return card;
    },
    
    parseSentenceProduction: function(card, children) {
      for (var idx in children) {
        var idx = parseInt(idx);
        var child = children[idx];
        if (child.tagName == "P" && child.textContent.length > 3 && child.children.length == 0) {
          if (child.textContent.indexOf("用法") >= 0) {
            card["usage"].push(child.textContent);
          } else {
            if (child.textContent != card["keyword"]) {
              card['top-down'].push(child.textContent);
            }
          }
        }

        var mark_elm = child.getElementsByTagName("mark")[0];
        if (mark_elm != undefined) {
          card["word"] = mark_elm.textContent;
        }

        if (child.tagName == "H2" && idx == 0) {
          card["english"] = child.textContent;
          card["hanzi"] = children[idx+1].textContent;
          card["keyword"] = children[idx+2].textContent; // the next element is usually cloze keyword
//           var mark_elm = child.getElementsByTagName("mark")[0];
//           if (mark_elm != undefined) {
//             card["word"] = mark_elm.textContent;
//           }
        }
        else if (child.textContent.startsWith("Characters:")) {
          for (var propelm of child.children) {
            if (!propelm.textContent || propelm.textContent == "Characters:") { continue }
            var textContent = propelm.textContent.trim();
            if (textContent == "Untitled") {
              var splits = propelm.getElementsByTagName('a')[0].getAttribute("href").split("/");
              textContent = splits[splits.length-1];
            }
            card['characters'].push(textContent);
          }
        }
        else {
          this.attachAudio(card, child);
        }
      }
      this.attachNotes(card);
      return card;
    },

    parseProp: function(card, children) {
      for (var child of children) {
        if (child.textContent.startsWith("Pick a prop for")) { card["component"] = child.textContent.split("Pick a prop for")[1].trim(); }
      }
      var edit_fields = document.getElementsByClassName("group/editor")
      for (var elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-prop") > 0) {
          if (elm.textContent.length > 0) {
            card['notes'].push(elm.textContent);
          }
        }
      }
      return card;
    },

    parseSet: function(card, children) {
      for (var child of children) {
        if (child.textContent.startsWith("Pick a set for")) { card["pinyinfinal"] = child.textContent.split("Pick a set for")[1].trim(); }
      }
      var edit_fields = document.getElementsByClassName("group/editor")
      for (var elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-set") > 0) {
          if (elm.textContent.length > 0) {
            card['notes'].push(elm.textContent);
          }
        }
      }
      return card;
    },

    parseActor: function(card, children) {
      for (var child of children) {
        if (child.textContent.startsWith("Pick an actor for")) { card["pinyininitial"] = child.textContent.split("Pick an actor for")[1].trim(); }
      }
      var edit_fields = document.getElementsByClassName("group/editor")
      for (var elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-actor") > 0) {
          if (elm.textContent.length > 0) {
            card['notes'].push(elm.textContent);
          }
        }
      }
      return card;
    },
    
    parseWordConnection: function(card, children) {
      for (var idx in children) {
        idx = parseInt(idx);
        var child = children[idx];
        
        if (child.textContent.startsWith("Meaning") || child.textContent.startsWith("English")) { card["keyword"] = children[idx+1].textContent; }
        else if (child.textContent.startsWith("Pinyin")) { card["pinyin"] = children[idx+1].textContent; }
        else if (child.textContent.startsWith("Word connection:")) {
          card["hanzi"] = child.textContent.split("Word connection:")[1].trim();
        }
        else if (child.textContent.startsWith("Word:")) {
          card["hanzi"] = child.textContent.split("Word:")[1].trim();
        }
        else {
          this.attachAudio(card, child);
        }
      }
      var edit_fields = document.getElementsByClassName("group/editor")
      for (var elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-lived") > 0) {
          if (elm.textContent.length > 0) {
            card['notes'].push(elm.textContent);
          }
        }
      }
      return card;
    },
    
    parseMovie: function(card, children) {
      for (var idx in children) {
        idx = parseInt(idx);
        var child = children[idx];

        if (child.textContent.startsWith("Keyword")) { card["keyword"] = children[idx+1].textContent; }
        else if (child.textContent.startsWith("Pinyin")) { card["pinyin"] = children[idx+1].textContent; }
        else if (child.textContent.startsWith("Actor")) {
          if (child.textContent.startsWith("Actors:")) {
            card['actor'] = children[idx].textContent.split("Actors:")[1].trim();
          }
          else {
            card['actor'] = children[idx].textContent.split("Actor:")[1].trim();
          }
        }
        else if (child.textContent.startsWith("Set")) { card['set'] = children[idx].textContent.split("Set:")[1].trim(); }
        else if (child.textContent.startsWith("Prop(s)") || child.textContent.startsWith("Props")) {
          var remaining = children.slice(idx);
          remaining.forEach(propelm => {
            var propValue = propelm.textContent.replace('Prop(s):', '').replace("Props:", "").trim();
            if (propelm.getElementsByTagName('a').length == 0) {
              ;
            } else {
              var propHtml = propelm.getElementsByTagName('a')[0].getAttribute('href');
              card['props'].push(`${propValue}`); // (<a href="https://traverse.link${propHtml}">Traverse Link</a>)`);
            }
          });
        }
        else {
          this.attachAudio(card, child);
        }
      }
      this.attachNotes(card);
      return card;
    },
  };

  var UI = {
    createFlash: function(message, timeout) {
      var toolbar = document.getElementsByClassName('MuiToolbar-regular')[0];
      var add_button = document.createElement('button');
      add_button.textContent = message;
      add_button.setAttribute("id", "success-icon-yay");
      add_button.setAttribute("class", "homescreen-button learn-mode-button-container add-to-reviews-button-container");
      add_button.setAttribute("style", "padding-right: 5px; padding-left: 5px; position: absolute; right: 0px; top: 58px; max-width: 300px; cursor: default;");
      var anchor = toolbar.getElementsByClassName('homescreen-button')[0].parentNode;
      anchor.appendChild(add_button);

      function removeSuccess() {
        document.getElementById("success-icon-yay").remove();
      };
      window.setTimeout(removeSuccess, timeout || 1200);
    },

    setDeckName: function(setting, def) {
      var miningDeck = unsafeWindow.localStorage.getItem(setting);
      if (!miningDeck) {
        miningDeck = def;
      }
      var deck = prompt("Enter deck name (make sure it exists!)", miningDeck);
      if (!deck) {
        deck = miningDeck;
      }
      unsafeWindow.localStorage.setItem(setting, deck);
    },

    myDropdown: function() {
      var dropdown = document.getElementById("myDropdown");
      dropdown.classList.toggle('show');
    },

    createMenu: function() {
      document.addEventListener('click', (event) => {
        if (!event.target.matches('.dropbtn')) {
          var dropdowns = document.getElementsByClassName("dropdown-content");
          for (var i = 0; i < dropdowns.length; i++) {
            var openDropdown = dropdowns[i];
            if (openDropdown.classList.contains('show')) {
              openDropdown.classList.remove('show');
            }
          }
        }
      });

      var outer_div = document.createElement('div');
      outer_div.classList.toggle("dropdown");
      var button = document.createElement('button');
      button.textContent = 'T2A';
      button.classList.toggle('homescreen-button');
      button.classList.toggle('dropbtn');
      button.setAttribute('title', 'Traverse 2 Anki Settings');
      button.addEventListener('click', this.myDropdown, false);
      outer_div.appendChild(button);

      var inner_div = document.createElement('div');
      inner_div.id = 'myDropdown';
      inner_div.classList.toggle("dropdown-content");
      outer_div.appendChild(inner_div);

      var scrape_card = document.createElement('a');
      scrape_card.setAttribute('title', 'Set Character Deck');
      scrape_card.textContent = 'Character Deck Name';
      scrape_card.addEventListener('click', () => { UI.setDeckName("miningDeck", ANKI.DEFAULTS.MOVIE.DECK);}, false);
      inner_div.appendChild(scrape_card);

      var st = document.createElement('a');
      st.setAttribute('title', 'Set Sentence Deck');
      st.textContent = 'Sentence Deck Name';
      st.addEventListener('click', function() { UI.setDeckName("sentenceDeck", ANKI.DEFAULTS.SENTENCE.DECK);}, false);
      inner_div.appendChild(st);

      var auto = document.createElement('a');
      auto.setAttribute('title', 'Create Anki cards from open level, starting with the selected node');
      auto.textContent = 'Automagic';
      auto.addEventListener('click', Traverse.automateLevel, false);
      inner_div.appendChild(auto);

      var toolbars = document.getElementsByClassName('MuiToolbar-regular');
      if (toolbars.length > 0) {
        toolbar = toolbars[0];
        var anchor = toolbar.getElementsByClassName('homescreen-button')[0].parentNode;
        anchor.appendChild(outer_div);
        console.debug('download button created');
      } else {
        console.debug('MuiToolbar-regular not found, probably not on relevant page');
      }
    },

    createDownloadButton: function() {
      var toolbars = document.getElementsByClassName('MuiToolbar-regular');
      if (toolbars.length == 0) {
        console.log("No toolbar found, can not attach download button");
        return
      }
      toolbar = toolbars[0];

      var reveal_surface = document.getElementsByClassName('reveal-surface')[0];

      var add_button = document.createElement('button');
      add_button.textContent = 'Anki++';
      add_button.setAttribute('class', 'homescreen-button cue-button review-due-button onboarding-review-due button-glow');
      add_button.setAttribute('title', 'Add open card to Anki');
      add_button.addEventListener('click', Traverse.parseTraverseAndAdd, false);

      var anchor = toolbar.getElementsByClassName('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit')[0].parentNode; // homescreen-button')[0].parentNode;
      anchor.appendChild(add_button);
      console.log('download button created');
    }

  };


  unsafeWindow.we_are_there = false;
//   UI.createMenu();
  function areWeThereYet() {
    if (document.location.href.indexOf("/Mandarin_Blueprint/") > 0) {
      if (!unsafeWindow.we_are_there) { 
        UI.createDownloadButton();
        console.debug("yay");
        unsafeWindow.we_are_there = true;
        UI.createMenu();
      }
    } else {
      unsafeWindow.we_are_there = false;
      console.debug("nay");
    }
  }

  console.log("LOADED?!?!");
  window.setInterval(areWeThereYet, 5000); // occasional check to see if we're in the right spot
})();
