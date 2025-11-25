// ==UserScript==
// @name         Traverse Export To Anki
// @description  Export open Traverse cards to Anki (character or sentence cards)
// @version      2.3.1
// @grant        unsafeWindow
// @grant        GM.setValue
// @grant        GM.getValue
// @match        https://traverse.link/*
// ==/UserScript==

(function() {
  var SETTINGS = {
    stopAutomationFlag: false,
    DEBUG: false,
    DEFAULTS: {
      MOVIE: {DECK: "Mining", MODEL: "Character Note", TAG: "4-MAKE-A-MOVIE"},
      PROP: {DECK: "Mining", MODEL: "PROP REVIEW", TAG: "1-PROPS"},
      SET: {DECK: "Mining", MODEL: "SET REVIEW", TAG: "3-SETS"},
      ACTOR: {DECK: "Mining", MODEL: "ACTOR REVIEW", TAG: "2-ACTORS"},
      WORDCONNECTION: {DECK: "Mining", MODEL: "WORD CONNECTION REVIEW", TAG: "5-UNLOCKED-VOCAB"},
      TPV: {DECK: "TPV", MODEL: "Sentence Note", TAG: "MB_TPV"},
      MSLK: {DECK: "MSLK", MODEL: "Sentence Note", TAG: "MB_MSLK"},
      CONVOCON: {DECK: "Conversation Connectors", MODEL: "MB CONVOCON REVIEW", TAG: "MB_CONVO_CON"},
      SENTENCE: {DECK: "Mining Sentences", MODEL: "Sentence Note", TAG: "SENTENCE"},
      SENTENCE_PRODUCTION: {DECK: "Mining Sentences", MODEL: "Sentence Note Production", TAG: "SENTENCE_PRODUCTION"}
    },
  };

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
      var targetDeck = unsafeWindow.localStorage.getItem("sentenceDeck") || SETTINGS.DEFAULTS.SENTENCE.DECK;
      var pictures = [];
      var audio_fields = [];
      var modelName = SETTINGS.DEFAULTS.SENTENCE.MODEL;
      var noteTag = "SENTENCE";
      var tags = card['tags'];
      tags.push(noteTag);

      var fields = {
        "Sentence": card["hanzi"],
        "English": card["english"] || "",
        "Keyword": card["word"] || "",
        "Notes": card["notes"].join("<br/>"),
        "Usage": card["usage"].join("<br/>"),
        "Top-Down Words": card["top-down"].join("<br/>")
      }

      if (card["word"]) {
        fields["Sentence"] = fields["Sentence"].replace(card["word"], `<span style="background-color: rgb(90, 131, 0);">${card["word"]}</span>`);
      }

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

    createSentenceProduction: function(card) {
      var targetDeck = unsafeWindow.localStorage.getItem("sentenceProductionDeck") || SETTINGS.DEFAULTS.SENTENCE_PRODUCTION.DECK;
      var pictures = [];
      var audio_fields = [];
      var modelName = SETTINGS.DEFAULTS.SENTENCE_PRODUCTION.MODEL;
      var noteTag = "SENTENCE_PRODUCTION";
      var tags = card['tags'];
      tags.push(noteTag);

      var fields = {
        "Chinese": card["hanzi"],
        "English": card["english"] || "",
        "Keyword": card["word"] || "",
        "Notes": card["notes"].join("<br/>"),
        "Usage": card["usage"].join("<br/>"),
        "Top-Down Words": card["top-down"].join("<br/>")
      }

      if (card["word"]) {
        fields["Chinese"] = fields["Chinese"].replace(card["word"], `<span style="background-color: rgb(90, 131, 0);">${card["word"]}</span>`);
      }

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
    
    createMSLK: function(card) {
      var targetDeck = SETTINGS.DEFAULTS.MSLK.DECK;
      var modelName = SETTINGS.DEFAULTS.MSLK.MODEL;
      var noteTag = SETTINGS.DEFAULTS.MSLK.TAG;
      var pictures = [];
      var audio_fields = [];
      var tags = card['tags'];
      tags.push(noteTag);

      var fields = {
        "Sentence": card["sentence"],
        "English": card["english"] || "",
        "Pinyin": card["pinyin"] || "",
        "Keyword": card["word"] || "",
        "Notes": card["notes"].join("<br/>"),
        "Usage": card["usage"].join("<br/>"),
        "Top-Down Words": card["top-down"].join("<br/>")
      }

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
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || SETTINGS.DEFAULTS.PROP.DECK;
      var tags = card['tags'];
      var prop = `${card["notes"].join("<br/>")}`;
      var fields = {
        COMPONENT: card["component"] || "empty",
        PROP: prop || "()",
        "SOURCE LESSON": card["source lesson"] || "",
      };
      var modelName = SETTINGS.DEFAULTS.PROP.MODEL;
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
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || SETTINGS.DEFAULTS.SET.DECK;
      var tags = card['tags'];
      var set = `${card["notes"].join("<br/>")}`;
      var fields = {
        "PINYIN FINAL": card["pinyinfinal"],
        SET: set || "()",
        "SOURCE LESSON": card["source lesson"] || "",
      };
      var modelName = SETTINGS.DEFAULTS.SET.MODEL;
      var noteTag = SETTINGS.DEFAULTS.SET.TAG;
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
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || SETTINGS.DEFAULTS.ACTOR.DECK;
      var tags = card['tags'];
      var actor = `${card["notes"].join("<br/>")}`;
      var fields = {
        "PINYIN INITIAL": card["pinyininitial"],
        ACTOR: actor || "()",
        "SOURCE LESSON": card["source lesson"] || "",
      };
      var modelName = SETTINGS.DEFAULTS.ACTOR.MODEL;
      var noteTag = SETTINGS.DEFAULTS.ACTOR.TAG;
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
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || SETTINGS.DEFAULTS.WORDCONNECTION.DECK;
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
      var modelName = SETTINGS.DEFAULTS.WORDCONNECTION.MODEL;
      var noteTag = SETTINGS.DEFAULTS.WORDCONNECTION.TAG;
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
      var targetDeck = unsafeWindow.localStorage.getItem("miningDeck") || SETTINGS.DEFAULTS.MOVIE.DECK;
      var modelName = SETTINGS.DEFAULTS.MOVIE.MODEL;
      var noteTag = SETTINGS.DEFAULTS.MOVIE.TAG;
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
      var targetDeck = unsafeWindow.localStorage.getItem("convoDeck") || SETTINGS.DEFAULTS.CONVOCON.DECK; // "Conversation Connectors";
      var modelName = SETTINGS.DEFAULTS.CONVOCON.MODEL; // "MB CONVOCON REVIEW";
      var tags = card['tags'];
      var noteTag = SETTINGS.DEFAULTS.CONVOCON.TAG; // "MB_CONVO_CON";
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
      else if (card["type"] == "sentence_production") {
        note = this.createSentenceProduction(card);
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
        UI.createFlash(`unknown card type (${card["type"]})`);
        return;
      }

      if (note) {
        console.log(card);
        console.log(note);
        if (!SETTINGS.debug) {
	        return this.anki_invoke('addNote', 6, note).then(result => { UI.createFlash("Added!"); });
        }
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
      var graph_elements = document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full");
      if (graph_elements[0].textContent.indexOf("TPV - ") >= 0) {
        card["type"] = "TPV";
        return;
      }
      if (graph_elements[0].textContent.indexOf("Mandarin Speaking and Listening Kickstarter") >= 0) {
        card["type"] = "MSLK";
        return;
      }

      for (var idx=0; idx<children.length; idx++) {
        var child = children[idx];
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
          if (toplevel_h2[0].nextElementSibling.tagName == "P" && toplevel_h2[0].nextElementSibling.getElementsByClassName("highlight-review").length > 0) {
            card['type'] = 'sentence';
          }
          else if (toplevel_h2[0].getElementsByClassName("highlight-review").length > 0 || toplevel_h2[0].textContent.indexOf("。") > 0){
            card['type'] = 'sentence';
          } else {
            if (toplevel_h2[0].textContent.match(/[A-Za-z]/g).length > 3) {
	            card['type'] = 'sentence_production';
            } else {
              card['type'] = 'sentence';
            }
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

    cleanText: function(textelm) {
      return textelm.replaceAll("Your browser does not support the audio element.", "").trim();
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
          card["englishPhrase"] = this.cleanText(children[idx+1].textContent);
        }
        else if (child.textContent.startsWith("Chinese phrase:")) {
          card["chinesePhrase"] = this.cleanText(children[idx+1].textContent);
          card["pinyin"] = this.cleanText(children[idx+2].textContent);
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
        english: "",
        sentence: "",
        pinyin: "",
        audio: [],
        tags: ["MSLK"],
        notes: [],
      };
      for (var idx in children) {
        idx = parseInt(idx);
        var child = children[idx];

        if (child.textContent.startsWith("English")) {
          card["english"] = this.cleanText(children[idx+1].textContent);
        }
        else if (child.textContent.startsWith("Chinese")) {
          card["pinyin"] = this.cleanText(children[idx+2].textContent);
          var phrase = this.cleanText(children[idx+1].textContent);
          card["sentence"] = phrase;
        }
        else if (child.textContent.startsWith("Phrase #")) {
          var phraseNum = child.textContent.split("Phrase #")[1].trim();
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
        UI.createFlash("Error! Could not identify card type", 5000, true);
        console.error("could not identify card type, sorry");
        return;
      }
      console.debug("detected card info", card);
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
      if (card["type"] == "TPV") { console.log(card); }
      return card
    },

    parseTraverseAndAdd: function() {
      var card = Traverse.parseTraverseCard();
      if (card && ["movie review", "sentence", "sentence_production", "prop", "set", "actor", "wordconnection", "convo_connector"].indexOf(card["type"]) >= 0) {
        ANKI.createAnkiNote(card);
      }
    },
    
    enqueueLevel: function() {
     	var queue = [];
      var elms = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"));
			for (var e of elms) {
        if (e.textContent.indexOf(" - 汉字") >= 0 || e.textContent.indexOf(" - 句子") >= 0) {
          queue.push(e);
        }
      }

      queue[0].click();
      console.log('asdasd');
      window.setTimeout(() => {console.log("calling"); Traverse.automateLevel(); }, 3000);
    },

    automateLevel: function() {
      console.log("hello");
			SETTINGS.stopAutomationFlag = false;
			UI.createStopButton();

      function doit(pointer) {
        var delaySeconds = 12;
        console.log("moving pointer?", pointer);
        console.log("stopping?", SETTINGS.stopAutomationFlag);
        Traverse.parseTraverseAndAdd(); // collect open card

				var elms = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"))
        var elm = elms[pointer];
        var remaining = elms.slice(pointer, elms.length);
        
        console.log(elm);

        if (SETTINGS.stopAutomationFlag == true) {
          UI.createFlash("Automation aborted", 9000);
          console.log("aborting automation");
          return;
        }

        if (!elm || elm.textContent.indexOf("CLICK HERE") >= 0 || elm.textContent.indexOf("LEVEL") >= 0 || elm.textContent.indexOf("句子") >= 0) {
          console.log("no more elements to add, level done?");
          UI.createFlash("Level/segment done!", 5000);
          Traverse.stopAutomation();
          return; // done!
        }
        console.log(`${remaining.length} left, ~ ${remaining.length * delaySeconds} sec. (${remaining.length * delaySeconds / 60} min.)`);

        if (elm.textContent.indexOf("PROP") >= 0) {
          delaySeconds = 6;
        }

        elm.click();
        console.debug("clicked");

        window.setTimeout(
          (pointer) => {
            doit(pointer)
          },
          delaySeconds * 1000,
          pointer+1);
      }


      var elms = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"));
      elms = elms.slice(1, elms.length);  // first element is the level header/item

      var selectedStyle = "(0, 148, 255)";
      var idx = 0;
      for (idx in elms) {
        idx = parseInt(idx);
        var elm = elms[idx];

        if ((elm.textContent.indexOf(" - 汉字") >= 0 || elm.textContent.indexOf(" - 句子") >= 0 ) && elm.parentNode.parentNode.style['border-color'].split(" rgb")[2] == selectedStyle) { // it's the next one lol
          idx++;
          break;
        }

        if (elm.parentNode.parentNode.style['border-color'].split(" rgb")[2] == selectedStyle) {
          console.log(`current selected element position: idx: ${idx}: ${elm.textContent}`);
          break;
        }
      }
      UI.createFlash(`Automation begun! (~ ${elms.slice(idx, elms.length).length * 12 / 60} min)`, 8000);

      elm = elms[idx];
      idx++;
      elm.click();
      window.setTimeout((pointer) => {doit(pointer)}, 12000, idx+1);

    },

    stopAutomation: function() {
      SETTINGS.stopAutomationFlag = true;
      elm = document.getElementById("stopauto");
      elm.remove();
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
      var card = {
        'type': "sentence",
        'hanzi': '',
        'english': '',
        'keyword': null,
        'audio': [],
        'notes': [],
        'usage': [],
        'characters': [],
        'source lesson': null,
        'tags': card["tags"],
        'top-down': [],
        'word': ""
      };


      for (var idx in children) {
        var idx = parseInt(idx);
        var child = children[idx];
        if (child.tagName == "P" && child.textContent.length > 3 && child.children.length == 0) {
          if (child.textContent.indexOf("用法") >= 0) { // this crap seems to appear during intermediate+
            card["usage"].push(child.textContent);
          } else {
            if (child.textContent.match(/^\d\./) || child.textContent.match(/^"/)) { // sometimes usage parts start with <number><dot> or " , which seem unique to this field
              card["usage"].push(child.textContent);
            }
            else {
              if (card["usage"].indexOf(child.textContent) < 0) {  // we found some text, it's usually a top-down word at this point
                card['top-down'].push(child.textContent);
              }
            }
          }
        }

        if (child.tagName == "H2" && idx == 0) {
          card["hanzi"] = child.textContent;
          if (children[idx+1].tagName == "P" && children[idx+1].textContent.length > 0) {  // for dialogues, the siblings are sometimes P-tags
            card["hanzi"] += children[idx+1].textContent;
          }

          var mark_elm = child.getElementsByTagName("mark")[0];
          if (mark_elm != undefined) {
            card["word"] = mark_elm.textContent;
          }
          if (child.nextElementSibling.tagName == "P" && child.nextElementSibling.getElementsByClassName("highlight-review").length > 0) {
            var mark_elm = child.nextElementSibling.getElementsByClassName("highlight-review")[0];
            card["word"] = mark_elm.textContent;
          }
        }
        else if (child.tagName == "H2" && idx > 0) { // it's the english phrase
          card["english"] = child.textContent;
          if (children[idx+2].textContent.length > 3) {   // .. and a short text explaining the usage, if any
          	card["usage"].push(children[idx+2].textContent);
            if (children[idx+3].tagName == "P" && this.cleanText(children[idx+3].textContent).length > 0) {
              card["usage"].push(this.cleanText(children[idx+3].textContent));
            }
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
    
    getSiblings: function(node) {
      const siblings = [];
	    let nextSibling = node.nextElementSibling;

	    while (nextSibling) {
		    if (nextSibling.tagName != "P" || (nextSibling.tagName == "P" && nextSibling.getElementsByTagName("span").length > 0)) { break } // it's not a relevant tag, or has nested tags (probably audio)
		    if (nextSibling.tagName == "P") { siblings.push(nextSibling); }
	        nextSibling = nextSibling.nextElementSibling;
	    }
	    return siblings;
    },

    parseSentenceProduction: function(card, children) {
      var card = {
        'type': "sentence_production",
        'hanzi': '',
        'english': '',
        'keyword': null,
        'audio': [],
        'notes': [],
        'usage': [],
        'characters': [],
        'source lesson': null,
        'tags': card["tags"],
        'top-down': [],
        'word': "",
      };
      
      for (var idx in children) {
        var idx = parseInt(idx);
        var child = children[idx];

        var mark_elm = child.getElementsByTagName("mark")[0];
        if (mark_elm != undefined) {
          card["word"] = mark_elm.textContent;
        }

        if (child.tagName == "H2" && idx == 0) {
          card["english"] = child.textContent;
        }
        else if (child.tagName == "H2" && idx > 0) { // it's the chinese phrase
          card["hanzi"] = child.textContent;
          
          if (children[idx+1].textContent.length > 0) {
            if (children[idx+1].getElementsByTagName("mark")[0]) {
              card["hanzi"] += children[idx+1].textContent;
              if (this.cleanText(children[idx+2].textContent).length > 0) {
              	card["top-down"].push(this.cleanText(children[idx+2].textContent));
              }
            } else {
              if (this.cleanText(children[idx+1].textContent).length > 0) {
								console.log(children[idx+1].textContent);
                console.log(this.cleanText(children[idx+1].textContent));
              	card["top-down"].push(this.cleanText(children[idx+1].textContent));
              }
            }
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
          for (var img of elm.getElementsByTagName("img")) {
            console.log(img.getAttribute('src'));
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
    createFlash: function(message, timeout, warning) {
      var toolbar = document.getElementsByClassName('MuiToolbar-regular')[0];
      var add_button = document.createElement('button');
      add_button.textContent = message;
      add_button.setAttribute("id", "success-icon-yay");
      if (warning) {
        add_button.setAttribute("class", "homescreen-button learn-mode-button-container skip-button-container");
      } else {
      	add_button.setAttribute("class", "homescreen-button learn-mode-button-container add-to-reviews-button-container");
      }
      add_button.setAttribute("style", "padding-right: 5px; padding-left: 5px; position: absolute; right: 0px; top: 58px; max-width: 300px; cursor: default; min-height: 50px; height: fit-content;");
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

    createStopButton: function() {
      var toolbar = document.getElementsByClassName('MuiToolbar-regular')[0];
      var add_button = document.createElement('button');
      add_button.textContent = 'Stop Auto';
      add_button.setAttribute('class', 'homescreen-button cue-button review-due-button onboarding-review-due button-glow');
      add_button.setAttribute('title', 'Stop automation');
      add_button.setAttribute('id', 'stopauto');
      add_button.addEventListener('click', Traverse.stopAutomation, false);
      var anchor = toolbar.getElementsByClassName('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit')[0].parentNode; // homescreen-button')[0].parentNode;
      anchor.appendChild(add_button);
    },

    createMenu: function() {
      if (document.getElementById("t2amenu")) return;

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
      button.setAttribute("id", "t2amenu");
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
      scrape_card.addEventListener('click', () => { UI.setDeckName("miningDeck", SETTINGS.DEFAULTS.MOVIE.DECK);}, false);
      inner_div.appendChild(scrape_card);

      var st = document.createElement('a');
      st.setAttribute('title', 'Set Sentence Deck');
      st.textContent = 'Sentence Deck Name';
      st.addEventListener('click', function() { UI.setDeckName("sentenceDeck", SETTINGS.DEFAULTS.SENTENCE.DECK);}, false);
      inner_div.appendChild(st);

      var st = document.createElement('a');
      st.setAttribute('title', 'Set Sentence Production Deck');
      st.textContent = 'SentenceProduction Deck Name';
      st.addEventListener('click', function() { UI.setDeckName("sentenceProductionDeck", SETTINGS.DEFAULTS.SENTENCE_PRODUCTION.DECK);}, false);
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
        console.debug('menu button created');
      } else {
        console.debug('MuiToolbar-regular not found, probably not on relevant page');
      }
    },

    createDownloadButton: function() {
      if (document.getElementById("a++")) return;
      
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
      add_button.setAttribute('id', 'a++');
      add_button.addEventListener('click', Traverse.parseTraverseAndAdd, false);

      var anchor = toolbar.getElementsByClassName('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit')[0].parentNode; // homescreen-button')[0].parentNode;
      anchor.appendChild(add_button);
      console.log('download button created');
      this.createMenu();
    }

  };

  console.log("LOADED?!?!");
//     // --- MutationObserver (No changes) ---
    const observerCallback = function(mutationsList, observer) {
      const avatar = document.getElementsByClassName("MuiAvatar-root MuiAvatar-circular MuiAvatar-colorDefault");
      const buttonNode = document.getElementById('t2amenu');
      if (document.location.href.indexOf("/Mandarin_Blueprint/") > 0 && avatar[0]) {
        if (!buttonNode) { 
          UI.createDownloadButton();
        }
      }
    };
    const observer = new MutationObserver(observerCallback);
    observer.observe(document.body, { childList: true, subtree: true });
  
})();
