// ==UserScript==
// @name         Traverse2Anki
// @description  Export Traverse cards to Anki
// @version      2.5
// @require      https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js
// @resource     handlebarjs https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.js
// @grant        unsafeWindow
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.getResourceUrl
// @match        https://traverse.link/*
// ==/UserScript==


let script = document.createElement("script");
GM.getResourceUrl("handlebarjs").then(res => {
  script.src = res;
  document.body.appendChild(script);
});


(function() {
  var SETTINGS = {
    stopAutomationFlag: false,
    DEBUG: true,

    USER_CONFIG: JSON.parse(unsafeWindow.localStorage.getItem("traverse2AnkiConfig") || "{}"),

    DEFAULTS: {
      MOVIE: {
        DECK: "Mining", MODEL: "Character Note", TAG: "4-MAKE-A-MOVIE", CONFIG_KEY: "MOVIE_DECK",
        FIELDS: {HANZI: "hanzi", KEYWORD: "keyword", PINYIN: "pinyin", ACTOR: "actor", SET: "set", PROPS: "props", NOTES: "notes", "SOURCE LESSON": "source lesson"}, // {field_in_anki: field_from_t2a}
        IMAGE_FIELDS: {"STROKE ORDER": "image"},
      	AUDIO_FIELDS: {AUDIO: "audio"},
      },
      PROP: {
        DECK: "Mining", MODEL: "PROP REVIEW", TAG: "1-PROPS", CONFIG_KEY: "MOVIE_DECK",
        FIELDS: {COMPONENT: "component", PROP: "notes", "SOURCE LESSON": "source lesson"}
      },
      SET: {
        DECK: "Mining", MODEL: "SET REVIEW", TAG: "3-SETS", CONFIG_KEY: "MOVIE_DECK",
        FIELDS: {"PINYIN FINAL": "pinyinfinal", SET: "notes", "SOURCE LESSON": "source lesson"}
      },
      ACTOR: {
        DECK: "Mining", MODEL: "ACTOR REVIEW", TAG: "2-ACTORS", CONFIG_KEY: "MOVIE_DECK",
        FIELDS: {"PINYIN INITIAL": "pinyininitial", ACTOR: "notes", "SOURCE LESSON": "source lesson"}
      },
      WORDCONNECTION: {
        DECK: "Mining", MODEL: "WORD CONNECTION REVIEW", TAG: "5-UNLOCKED-VOCAB", CONFIG_KEY: "MOVIE_DECK",
        FIELDS: {WORD: "hanzi", PINYIN: "pinyin", MEANING: "keyword", "LIVED EXPERIENCE": "notes", "SOURCE LESSON": "source lesson"},
        IMAGE_FIELDS: {IMAGE: "images"},
      	AUDIO_FIELDS: {AUDIO: "audio"},
    	},
      TPV: {
        DECK: "AUTO", MODEL: "Sentence Note (and reversed)", TAG: "TPV", CONFIG_KEY: "TPV_DECK",
      	FIELDS: {Sentence: "sentence", English: "english", Pinyin: "pinyin", Keyword: "word", Notes: "notes"},
      	IMAGE_FIELDS: {Image: "images"},
        AUDIO_FIELDS: {Audio: "audio"},
      },
      MSLK: {
        DECK: "AUTO", MODEL: "Sentence Note (and reversed)", TAG: "MSLK", CONFIG_KEY: "MSLK_DECK",
      	FIELDS: {Sentence: "sentence", English: "english", Pinyin: "pinyin", Keyword: "word", Notes: "notes"},
        AUDIO_FIELDS: {Chinese_Audio: "chinese_audio", English_Audio: "english_audio", Audio: "audio"},
      },
      CONVOCON: {
        DECK: "Conversation Connectors", MODEL: "MB CONVOCON REVIEW", TAG: "MB_CONVO_CON", CONFIG_KEY: "CONVOCON_DECK",
        FIELDS: {PHRASE_CHINESE: "chinesePhrase", PHRASE_ENG: "englishPhrase", PINYIN: "pinyin", NOTES: "notes"},
        AUDIO_FIELDS: {AUDIO: "audio"},
      },
      SENTENCE: {
        DECK: "Mining Sentences", MODEL: "Sentence Note", TAG: "SENTENCE", CONFIG_KEY: "SENTENCE_DECK",
        FIELDS: {Sentence: "hanzi", English: "english", Keyword: "word", Notes: "notes", Usage: "usage", "Top-Down Words": "top-down"}, // {field_in_anki: field_from_t2a}
        IMAGE_FIELDS: {Image: "images"},
        AUDIO_FIELDS: {Audio: "audio"},
        HIGHLIGHT_FIELDS: {Sentence: "word"} // highlight the "word" (t2a_name) in Sentence (Anki name)
      },
      SENTENCE_PRODUCTION: {
        DECK: "Mining Sentences", MODEL: "Sentence Note Production", TAG: "SENTENCE_PRODUCTION", CONFIG_KEY: "SENTENCE_PRODUCTION_DECK",
        FIELDS: {Chinese: "hanzi", English: "english", Keyword: "word", Notes: "notes", Usage: "usage", "Top-Down Words": "top-down"}, // {field_in_anki: field_from_t2a}
        IMAGE_FIELDS: {Image: "images"},
        AUDIO_FIELDS: {Audio: "audio"},
        HIGHLIGHT_FIELDS: {Chinese: "word"} // highlight the "word" (t2a_name) in Chinese (Anki name)
      }
    },

    ANKI_MODELS: [], // fetched from remote at startup

    getConfig: function(key, def) {
      let config = JSON.parse(unsafeWindow.localStorage.getItem("traverse2AnkiConfig") || "{}");
      return config[key] || def;
    },

    setConfig: function(key, value) {
      let config = JSON.parse(unsafeWindow.localStorage.getItem("traverse2AnkiConfig") || "{}");
      config[key] = value;
      unsafeWindow.localStorage.setItem("traverse2AnkiConfig", JSON.stringify(config));
      return value;
    },

    migrateConfig: function() {
      console.log("[T2A] - migrating legacy config keys to new config, this feature will be removed in a later update");
      let miningDeck = unsafeWindow.localStorage.getItem("miningDeck");
      if (miningDeck) {
        this.setConfig("MOVIE_DECK", miningDeck);
        unsafeWindow.localStorage.removeItem("miningDeck");
      }

      let sentenceDeck = unsafeWindow.localStorage.getItem("sentenceDeck");
      if (sentenceDeck) {
        this.setConfig("SENTENCE_DECK", sentenceDeck);
        unsafeWindow.localStorage.removeItem("sentenceDeck");
      }

      let sentenceProductionDeck = unsafeWindow.localStorage.getItem("sentenceProductionDeck");
      if (sentenceProductionDeck) {
        this.setConfig("SENTENCE_PRODUCTION_DECK", sentenceProductionDeck);
        unsafeWindow.localStorage.removeItem("sentenceProductionDeck");
      }
    }
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
    let elm = document.createElement(elmtype);
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

    getDeckName: function(deckName, cardType) {
      if (deckName.indexOf("AUTO") < 0) { // no autodetect
        return deckName;
      }

      let elms = document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full");

      let top_elem = elms[0];
      var phase = '';
      var level = '';
      var deckParts = [];
      if (top_elem.textContent.includes(' - ') ) {
      	let splits = top_elem.textContent.split(' - ');
      	level = splits[0].trim();
      	phase = splits[1].trim();
      }

      var subSection = '';

      if (elms[0].textContent.includes("TPV - ") ) {
        phase = elms[0].textContent.split('TPV -')[1].trim();
        level = elms[1].textContent;
        subSection = elms[2].textContent.replace(level, "");
        deckParts = ["TPV", phase, level, subSection];
      }
      else if (elms[1].textContent.includes("MSLK") ) {
				deckParts = ["MSLK", elms[1].textContent];
      }
      else if (['Intermediate', '中级课程', 'Upper-Intermediate', '高中级课程', 'Advanced Course', '高级课程', 'Advanced Course 高级课程'].includes(phase)) { // Level 37 - Intermediate
        if (phase == "Intermediate" || phase == "中级课程") { phase = "Phase 6 - Intermediate (37-58)"; }
        if (phase == "Upper-Intermediate" || phase == "高中级课程") { phase = "Phase 7 - Upper Intermediate (59-67)"; }
        if (phase.includes("Advanced Course") || phase.includes("高级课程") ) { phase = "Phase 8 - Advanced (68-88)"; }

        subSection = elms[1].textContent.match(/[0-9]+\s-\s[0-9]+$/)[0];
        if (elms[1].textContent.includes("Vocab in Context") || elms[1].textContent.includes("语境") || elms[1].textContent.includes("V.I.C.") || elms[1].textContent.includes("句子") ) { // Level 37 Vocab in Context #593 - 600       58级 - 语境. # 1531 - 1540
          subSection += " - Vocab In Context";
        }
        deckParts = [phase, level, subSection];
      }
      else if (['Phase 1', 'Phase 2', 'Phase 3', 'Phase 4', 'Phase 5'].includes(phase)) {
        subSection = 'Course'; // default for most
        if (cardType == "SENTENCE") {
          subSection = 'Sentence';
        }
        if (cardType == "SENTENCE_PRODUCTION") {
          subSection = 'Sentence Production';
        }
      	deckParts = [phase, level, subSection];
      }

      deckName = deckName.replace("AUTO", deckParts.join("::")); // "<custom base deck>::{phase}::{level}::{subsection}" e.g. MyMB::Phase 3::Level 18::Course, or MyMB::Phase 7 - Upper Inter...::Level 64::1821 - 1830 - Vocab In Context
      return deckName;
    },

    generateUID: function() {
      let firstPart = (Math.random() * 466566) | 0;
      let secondPart = (Math.random() * 466566) | 0;
      firstPart = ("00000" + firstPart.toString(36)).slice(-5);
      secondPart = ("00000" + secondPart.toString(36)).slice(-5);
      return firstPart + secondPart;
    },

    createNoteFromCard: function(card, config_key, settingsCtx) {
      var targetDeck = SETTINGS.getConfig(config_key, settingsCtx.DECK);
      targetDeck = this.getDeckName(targetDeck, card.type);
      let modelName = settingsCtx.MODEL;
      let tags = card.tags;
      tags.push(settingsCtx.TAG);
      let pictures = [];
      let audio_fields = [];
      let fields = {};

      for (let key in settingsCtx.FIELDS) {
        if (key.length > 0) {
          let t2a_field_name = settingsCtx.FIELDS[key];
          let value = card[t2a_field_name];
          if (Array.isArray(value)) { // if it's a list
            value = value.join('<br/>');
          }
          fields[key] = value || "";
        }
      }
      if (settingsCtx.AUDIO_FIELDS) {
        for (let key in settingsCtx.AUDIO_FIELDS) {
          let t2a_field_name = settingsCtx.AUDIO_FIELDS[key];
          audio_fields = audio_fields.concat(this.formatAudio(card[t2a_field_name], tags[0], key));
        }
      }
      if (settingsCtx.IMAGE_FIELDS) {
        for (let key in settingsCtx.IMAGE_FIELDS) {
          let t2a_field_name = settingsCtx.IMAGE_FIELDS[key];
          pictures = pictures.concat(this.formatImages(card[t2a_field_name], tags[0], key));
        }
      }
      if (settingsCtx.HIGHLIGHT_FIELDS) {
        for (let key in settingsCtx.HIGHLIGHT_FIELDS) {
          let t2a_field_name = settingsCtx.HIGHLIGHT_FIELDS[key];
          if (card[t2a_field_name]) { // if there even is a value
            fields[key] = fields[key].replace(card[t2a_field_name], `<span style="background-color: rgb(90, 131, 0);">${card[t2a_field_name]}</span>`)
          }
      	}
      }

      let params = {
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

    formatImages: function(images, tagName, fieldName) {
      var pictures = [];
      images.forEach(image_url => {
        let split_fields = image_url.split("/");
        let filename = split_fields[split_fields.length-1].split('?')[0];
        if (filename.length > 36) {
          let dot_splits = filename.split('.');
          let ext = dot_splits[dot_splits.length-1];
          filename = tagName + "-" + this.generateUID(filename) + '.' + ext;
        }

        pictures.push({
          "url": image_url,
          "filename": filename,
          "skipHash": "",
          "fields": [
            fieldName
          ]
	      });
      });
      return pictures;
    },

    formatAudio: function(audios, tagName, fieldName) {
      var audio_fields = [];
      audios.forEach(a => {
        let split_fields = a.split("/");
        let filename = split_fields[split_fields.length-1];
        if (filename.length > 36) {
          filename = this.generateUID(filename)+'.mp3';
        }
        filename = tagName + "-" + filename;
        audio_fields.push({
          "url": a,
          "filename": filename,
          "skipHash": "",
          "fields": [fieldName]
        })
      });
      return audio_fields;
    },

    createAnkiNote: function(card) {
      let note = this.createNoteFromCard(card, SETTINGS.DEFAULTS[card.type].CONFIG_KEY, SETTINGS.DEFAULTS[card.type]);

      if (note) {
        console.log("[T2A] - card:", card);
        console.log("[T2A] - note to submit: ", note);
        if (SETTINGS.DEBUG == false) {
          return this.createAnkiDeck(note.note.deckName).then(res => {
            console.log(res);
            return this.addAnkiNote(note).then(result => { UI.createFlash(`Added in (${note.note.deckName})`); });
          });
        }
        else {
          UI.createFlash(`[debug] Added in (${note.note.deckName})`);
        }
      } else {
        console.error("[T2A] - could not create note, type not recognized: ", card);
      }
    },

    createAnkiDeck: function(deckName) {
      let deckParams = {"deck": deckName};
      return this.anki_invoke('createDeck', 6, deckParams);
    },

    addAnkiNote: function(note) {
      return this.anki_invoke('addNote', 6, note);
    },

    getAnkiModels: function() {
      return this.anki_invoke('modelNames', 6);
    },

    getAnkiFields: function(modelName) {
      return this.anki_invoke("modelFieldNames", 6, {"modelName":modelName});
    },

    getAnkiDecks: function() {
      this.anki_invoke('deckNames', 6).then(result => {
        console.log(`got list of decks: ${result}`);
      });
    },

    createModels: function() {
      const SentenceModelParams = {
        "modelName": "Sentence Note (and reversed)",
        "inOrderFields": ["Sentence", "English", "Keyword", "Pinyin", "Top-Down Words", "Usage", "Image", "Notes", "Mnemonics", "Audio", "Chinese_Audio", "English_Audio"],
        "css": `@font-face { font-family: myfont; src: url("_KaiTi.ttf"); } /* uses the KaiTi font if it exists */
.hanzi { 	font-family: AR PL KaitiM GB, kaiti, myfont; }
.card { font-size: 30px; text-align: left; color: black; }
.set { font-size: 25px;  font-weight: bold; text-align: center; color: #F69342; }
.English { font-size: 15px; text-align: left; }
.titles { font-size: 15px; text-align: left; font-weight: bold;}
img { width: auto;   height: auto;   max-width: 300px;   max-height: 300px; }`,
        "isCloze": false,
        "cardTemplates": [
          {
            "Name": "Sentence Review - recall the meaning",
            "Front": `<div class=set>SENTENCE REVIEW</div>
<div class=hanzi>{{Sentence}}</div>
<br>

{{#Top-Down Words}}
<div class=titles>Top-Down Words:</div>
<div class=English>{{Top-Down Words}}</div>
<br/>
{{/Top-Down Words}}

{{#Image}}
<div class=titles>Image</div>
{{Image}}{{/Image}}
<br/><br/>

<div class=titles>Notes:</div>
<div class=English>{{Notes}}</div>

<br/>
{{Chinese_Audio}}`,
            "Back": `<div class=set>SENTENCE REVIEW</div>
<div class=hanzi>{{Sentence}}</div>
<br>

{{#English}}
<div class=titles>Translation:</div>
<div class=English>{{English}}</div>
{{/English}}
<br>

{{#Top-Down Words}}
<div class=titles>Top-Down Words:</div>
<div class=English>{{Top-Down Words}}</div>
<br/>
{{/Top-Down Words}}

{{#Image}}
<div class=titles>Image</div>
{{Image}}{{/Image}}
<br/><br/>

<div class=titles>Notes:</div>
<div class=English>{{Notes}}</div>

{{English_Audio}}`
          },
          {
            "Name": "Active Recall - produce the Chinese",
            "Front": `<div class=set>SENTENCE OUTPUT</div>
<div class=Sentence>{{English}}</div>
<br>

{{#Image}}
<div class=titles>Image</div>
{{Image}}{{/Image}}
<br/><br/>

<div class=titles>Notes:</div>
<div class=English>{{Notes}}</div>
<br/>

{{English_Audio}}`,
            "Back": `<div class=set>SENTENCE OUTPUT</div>
<div class=Sentence>{{English}}</div>
<br>

{{#Sentence}}
<div class=titles>Chinese:</div>
<div class=hanzi>{{Sentence}}</div>
{{/Sentence}}
<br/>

{{#Image}}
<div class=titles>Image</div>
{{Image}}{{/Image}}
<br/><br/>

<div class=titles>Notes:</div>
<div class=English>{{Notes}}</div>
<br/>

{{Chinese_Audio}}`
          }
        ]
      }
      if (!SETTINGS.ANKI_MODELS.includes(SentenceModelParams.modelName) ) {
      	this.anki_invoke("createModel", 6, SentenceModelParams).then( result => {
	        console.log(result);
	      });
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
    automationQueue: [],

    attachCardType: function(card, children) {
      let graph_elements = document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full");
      if (graph_elements[0].textContent.includes("TPV - ")) {
        card.type = "TPV";
        return;
      }
      if (graph_elements[0].textContent.indexOf("Mandarin Speaking and Listening Kickstarter") >= 0) {
        card.type = "MSLK";
        return;
      }

      for (let idx=0; idx<children.length; idx++) {
        let child = children[idx];
        if (child.textContent.startsWith("Movie review")) {
          card.type = 'MOVIE';
          return;
        }
        if (child.textContent.startsWith("Pick a prop")) {
          card.type = 'PROP';
          return;
        }
        if (child.textContent.startsWith("Pick a set for")) {
          card.type = 'SET';
          return;
        }
        if (child.textContent.startsWith("Pick an actor for")) {
          card.type = 'ACTOR';
          return;
        }
        if (child.textContent.startsWith("Word:") || child.textContent.startsWith("Word connection:")) {
          card.type = 'WORDCONNECTION';
          return;
        }
        if ((child.textContent.startsWith("Characters:") || child.textContent.startsWith("Sentence"))) {
          let toplevel_h2 = child.parentNode.getElementsByTagName("H2");
          if (toplevel_h2[0].nextElementSibling.tagName == "P" && toplevel_h2[0].nextElementSibling.getElementsByClassName("highlight-review").length > 0) {
            card.type = 'SENTENCE';
          }
          else if (toplevel_h2[0].getElementsByClassName("highlight-review").length > 0 || toplevel_h2[0].textContent.indexOf("。") > 0){
            card.type = 'SENTENCE';
          } else {
            if (toplevel_h2[0].textContent && toplevel_h2[0].textContent.match(/[A-Za-z]/g) && toplevel_h2[0].textContent.match(/[A-Za-z]/g).length > 3) {
	            card.type = 'SENTENCE_PRODUCTION';
            } else {
              card.type = 'SENTENCE';
            }
          }
          return;
        }
        if (child.textContent.startsWith("Add to reviews")) {
          card.type = "CONVOCON";
          return;
        }
        if (child.textContent.indexOf("Phrase #") >= 0) {
          card.type = "MSLK";
          return;
        }
      }
    },

    cleanText: function(textelm) {
      return textelm.replaceAll("Your browser does not support the audio element.", "").trim();
    },

    parseConvoConnector: function(children) {
      let card = {
        type: "CONVOCON",
        englishPhrase: "",
        chinesePhrase: "",
        pinyin: "",
        audio: [],
        tags: [],
        notes: [],
      };
      for (let idx in children) {
        idx = parseInt(idx);
        let child = children[idx];

        if (child.textContent.startsWith("English phrase:")) {
          card.englishPhrase = this.cleanText(children[idx+1].textContent); // .trim();
        }
        else if (child.textContent.startsWith("Chinese phrase:")) {
          card.chinesePhrase = this.cleanText(children[idx+1].textContent); // .trim();
          card.pinyin = this.cleanText(children[idx+2].textContent); // .replace("Your browser does not support the audio element.", "").trim();
        }
        else {
          this.attachAudio(card, child);
        }
      }
      console.log(card);
      return card;
    },

    parseMSLK: function(children) {
      let card = {
        type: "MSLK",
        english: "",
        sentence: "",
        pinyin: "",
        audio: [],
        tags: [],
        notes: [],
        chinese_audio: [],
        english_audio: [],
      };
      for (let idx in children) {
        idx = parseInt(idx);
        let child = children[idx];

        if (child.textContent.startsWith("English")) {
          card.english = this.cleanText(children[idx+1].textContent);
          this.attachAudio(card, children[idx+1], "english_audio");
          this.attachAudio(card, children[idx+2], "english_audio");
        }

        else if (child.textContent.startsWith("Chinese")) {
          var pinyin = this.cleanText(children[idx+2].textContent);
          if (pinyin.includes("Phrase #") ) {
           	pinyin = pinyin.split("Phrase #")[0];
          }
          card.pinyin = pinyin;
          var phrase = this.cleanText(children[idx+1].textContent);
          card.sentence = phrase;
          this.attachAudio(card, children[idx+2], "chinese_audio");
          this.attachAudio(card, children[idx+3], "chinese_audio");
        }
        if (child.textContent.includes("Phrase #")) {
          let phraseNum = child.textContent.split("Phrase #")[1].trim();
          card.tags.push(`Phrase#${phraseNum}`);
        }
      }
      return card;
    },

    parseTPV: function(children) {
      let card = {
        type: "TPV",
        english: "",
        sentence: "",
        pinyin: "",
        audio: [],
        images: [],
        tags: [],
        notes: [],
      };
      card.sentence = this.cleanText(children[0].textContent);
      card.pinyin = this.cleanText(children[1].textContent);
      card.english = this.cleanText(children[3].textContent);

      for (let idx in children) {
        let child = children[idx];
        this.attachAudio(card, child);
      }
			this.attachImages(card);
      this.attachNotes(card);
      return card;
    },

    parseTraverseCard: function() {
      let htmlchildren = document.getElementsByClassName("ProseMirror")[0].children;
      let children = [];
      for (let child of htmlchildren) {
        if (child.tagName != "H2" && !child.textContent) { continue }
        children.push(child);
      }

      let card = {
        'type': null,
        'tags': [],
      };

      this.attachCardType(card, children);
      if (!card.type) {
        UI.createFlash("Error! Could not identify card type", 5000, true);
        console.error("could not identify card type, sorry");
        return;
      }
      console.debug("[T2A] detected card info", card);
      try {
        let document_level = document.getElementsByClassName("max-h-full")[0].textContent.match(/\d+/)[0];
        let level_tag = "MBMLEVEL"+document_level;
        card.tags.push(level_tag);
      } catch { ; };

      if (card.type == "MOVIE") { card = this.parseMovie(card, children); }
      if (card.type == "SENTENCE") { card = this.parseSentence(card, children); }
      if (card.type == "SENTENCE_PRODUCTION") { card = this.parseSentenceProduction(card, children); }
      if (card.type == "PROP") { card = this.parseProp(card, children); }
      if (card.type == "SET") { card = this.parseSet(card, children); }
      if (card.type == "ACTOR") { card = this.parseActor(card, children); }
      if (card.type == "WORDCONNECTION") { card = this.parseWordConnection(card, children); }
      if (card.type == "CONVOCON") { card = this.parseConvoConnector(children); }
      if (card.type == "MSLK") { card = this.parseMSLK(children); }
      if (card.type == "TPV") { card = this.parseTPV(children); }
      return card
    },

    parseTraverseAndAdd: function() {
      let card = Traverse.parseTraverseCard();
      if (card && ["MOVIE", "SENTENCE", "SENTENCE_PRODUCTION", "PROP", "SET", "ACTOR", "WORDCONNECTION", "CONVOCON", "MSLK", "TPV"].indexOf(card.type) >= 0) {
        ANKI.createAnkiNote(card);
      }
    },

    enqueueLevel: function() {
      Traverse.automationQueue.length = 0;
      let elms = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"));
      for (let idx in elms) {
        idx = parseInt(idx);
        let e = elms[idx];
        if (e.textContent.includes(" 汉字") || e.textContent.includes(" 句子") || e.textContent.includes(" Vocab In Context") || e.textContent.includes("V.I.C") || e.textContent.includes("语境.") || e.textContent.match(/^L[0-9]/) || e.textContent.match(/^MSLK/) ) {
          Traverse.automationQueue.push(idx);
        }
      }
      console.log(Traverse.automationQueue);
      window.setTimeout(() => { console.log("continuing"); Traverse.continueAutomation(); }, 3000);
    },

    continueAutomation: function() {
      if (Traverse.automationQueue.length > 0) {
        let elm_pointer = Traverse.automationQueue[0];
        Traverse.automationQueue = Traverse.automationQueue.slice(1, Traverse.automationQueue.length);
        let next_elm = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"))[elm_pointer];

        next_elm.click();
        console.log(Traverse.automationQueue);
        window.setTimeout(() => { console.log("calling"); Traverse.automateLevel(); }, 4000);
      } else {
        Traverse.stopAutomation();
        console.log("automation queue is empty, done!");
      }
    },

    navigateTopLevel: function() {
      let toplevel = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"))[0];
      toplevel.click();
    },

    automateLevel: function() {
      console.log("hello auto");
      SETTINGS.stopAutomationFlag = false;
      UI.createStopButton();

      function doit(pointer) {
        let delaySeconds = 8;
        console.log("moving pointer?", pointer);
        console.log("stopping?", SETTINGS.stopAutomationFlag);

        let ahrefs = document.getElementsByClassName("ProseMirror")[0].getElementsByTagName("a");
        let unresolved = Array.from(ahrefs).filter(a => a.textContent.includes("Mandarin_Blueprint/"));
      	if (unresolved.length > 0) {
          console.log("not all links are resolved: ", unresolved);
	        window.setTimeout(() => { doit(pointer); }, 1000);
          return;
      	}

        Traverse.parseTraverseAndAdd(); // collect open card

        let elms = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"))
        let elm = elms[pointer];
        let remaining = elms.slice(pointer, elms.length);

        if (SETTINGS.stopAutomationFlag == true) {
          UI.createFlash("Automation aborted", 9000);
          console.log("aborting automation");
          return;
        }

        if (!elm || elm.textContent.indexOf("CLICK HERE") >= 0 || elm.textContent.indexOf("LEVEL") >= 0 || elm.textContent.indexOf("句子") >= 0) {
          console.log("no more elements to add, level done?");
					if (Traverse.automationQueue.length > 0) {
            UI.createFlash("segment done, continuing soon!", 5000);
            Traverse.navigateTopLevel();
            window.setTimeout(() => { console.log("continuing automation"); Traverse.continueAutomation(); }, 2000);
          } else {
	          UI.createFlash("Level/segment done, stopping automation!", 9000);
          	Traverse.stopAutomation();
          }
          return;
        }
        console.log(`${remaining.length} left, ~ ${remaining.length * delaySeconds} sec. (${remaining.length * delaySeconds / 60} min.)`);

        if (elm.textContent.indexOf("PROP") >= 0) {
          delaySeconds = 3;
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


      let elms = Array.from(document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full"));
      elms = elms.slice(1, elms.length); // first element is the level header/item

      let selectedStyle = "(0, 148, 255)";
      let idx = 0;
      for (idx in elms) {
        idx = parseInt(idx);
        var elm = elms[idx];

        if ((elm.textContent.includes(" 汉字") || elm.textContent.includes(" - 句子") || elm.textContent.includes(" Vocab in Context") || elm.textContent.includes("V.I.C.") || elm.textContent.match(/^L[0-9]/) )
            && elm.parentNode.parentNode.style['border-color'].split(" rgb")[2] == selectedStyle) { // it's the next one lol
          idx++;
          break;
        }

        if (elm.parentNode.parentNode.style['border-color'].split(" rgb")[2] == selectedStyle) {
          console.log(`current selected element position: idx: ${idx}: ${elm.textContent}`);
          break;
        }
      }
      UI.createFlash(`Automation begun! (~ ${elms.slice(idx, elms.length).length * 9 / 60} min)`, 8000);

      elm = elms[idx];
      idx++;
      elm.click();
      window.setTimeout((pointer) => {doit(pointer)}, 9000, idx+1);
    },

    stopAutomation: function() {
      SETTINGS.stopAutomationFlag = true;
      document.getElementById("stopauto").remove();
    },

    attachNotes: function(card) {
      let edit_fields = document.getElementsByClassName("group/editor")
      for (let elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("notes") > 0) {
          let textValue = elm.textContent;
          // detect a href
          let a_href = elm.getElementsByTagName("a");
          if (a_href.length > 0) {
            a_href = a_href[0];
            if (a_href.textContent == "Source Video Lesson") {
              card["source lesson"] = `<a href="${a_href.getAttribute('href')}">source lesson</a>`;
              textValue = textValue.replace('Source Video Lesson', '');
            }
          }
          if (textValue.length > 0) {
            card.notes.push(textValue);
          }
        }
      }
    },

    attachAudio: function(card, child, keyname="audio") {
      let audio_elms = child.getElementsByTagName('audio');
      for (let elm of audio_elms) {
        if (!elm.textContent) { continue; }
        card[keyname].push(elm.getAttribute('src'));
      }
    },

    attachImages: function(card, child) {
      let edit_fields = document.getElementsByClassName("group/editor");
      let image_field_ids = ["field-image", "field-picture", "field-personal", "field-notes"];
      for (let elm of edit_fields) {
        for (let image_field_id of image_field_ids) {
          if (elm.getAttribute('id').toLowerCase().indexOf(image_field_id) > 0) {
            for (let img of elm.getElementsByTagName("img")) {
              if (img.getAttribute('src')) {
                card.images.push(img.getAttribute('src'));
              }
            }
          }
        }
      }
    },

    parseSentence: function(card, children) {
      var card = {
        type: "SENTENCE",
        hanzi: '',
        english: '',
        keyword: null,
        audio: [],
        notes: [],
        usage: [],
        characters: [],
        "source lesson": null,
        tags: card.tags,
        "top-down": [],
        images: [],
        word: ""
      };

      let top_level = document.getElementsByClassName("max-h-full flex justify-between flex-nowrap items-start w-full")[0];

      for (var idx in children) {
        idx = parseInt(idx);
        let child = children[idx];
        if (child.tagName == "P" && child.textContent.length > 3 && child.children.length == 0 && !child.textContent.match(/^[AB]:/)) {
          if (child.textContent.indexOf("用法") >= 0 && card.usage.indexOf(child.textContent) < 0) { // this crap seems to appear during intermediate+
            card.usage.push(child.textContent);
          } else {
            if (child.textContent.match(/^\d\./) || child.textContent.match(/^"/)) { // sometimes usage parts start with <number><dot> or " , which seem unique to this field
              card.usage.push(child.textContent);
            }
            else {
              if (card.usage.indexOf(child.textContent) < 0) { // we found some text, it's usually a top-down word at this point
                card['top-down'].push(child.textContent);
              }
            }
          }
        }

        if (child.tagName == "H2" && idx == 0) {
          card.hanzi = child.textContent;
          if (children[1].tagName == "P" && children[1].textContent.length > 0) { // for dialogues, the siblings are sometimes P-tags
            console.log("oh no");
            console.log(children);
            card.hanzi += children[idx+1].textContent;
          }

          var mark_elm = child.getElementsByTagName("mark")[0];
          if (mark_elm != undefined) {
            card.word = mark_elm.textContent;
          }
          if (child.nextElementSibling.tagName == "P" && child.nextElementSibling.getElementsByClassName("highlight-review").length > 0) {
            let mark_elm = child.nextElementSibling.getElementsByClassName("highlight-review")[0];
            card.word = mark_elm.textContent;
          }
        }
        else if (child.tagName == "H2" && idx > 0) { // it's the english phrase
          if (top_level.textContent.indexOf("Intermediate") > 0 && children[idx+1].textContent.length > 0) {
            card.usage.push(children[idx+1].textContent);
          }

          card.english = child.textContent;
          let siblings = this.getSiblings(child);
          for (let sib of siblings) {
    	      if (sib.textContent.match(/^[AB]:/) ) {
   	         card.english += " " + sib.textContent;
      	    }
          }
          if (children[idx+2].textContent.length > 3 && !child.textContent.match(/^[AB]:/)) { // .. and a short text explaining the usage, if any
          	card.usage.push(children[idx+2].textContent);

            if (children[idx+3].tagName == "P" && this.cleanText(children[idx+3].textContent).length > 0) {
              card.usage.push(this.cleanText(children[idx+3].textContent));
            }
          }
        }

        else if (child.textContent.startsWith("Characters:")) {
          let siblings = [child];
          let nextSibling = child.nextElementSibling;
          while (nextSibling) {
            if (nextSibling.tagName == "P") { siblings.push(nextSibling); }
              nextSibling = nextSibling.nextElementSibling;
          }

          for (let propelm of siblings) {
            let textContent = propelm.textContent.replace("Characters:", "").trim();
            if (textContent == "Untitled") {
              let splits = propelm.getElementsByTagName('a')[0].getAttribute("href").split("/");
              textContent = splits[splits.length-1];
            }
            card.characters.push(textContent);
          }
        }
        else {
          this.attachAudio(card, child);
        }
      }

			this.attachImages(card);
      this.attachNotes(card);
      return card;
    },

    getSiblings: function(node) {
      const siblings = [];
	    let nextSibling = node.nextElementSibling;

	    while (nextSibling) {
		    if (nextSibling.tagName != "P" || (nextSibling.tagName == "P" && nextSibling.getElementsByTagName("span").length > 0)) {
          break; // it's not a relevant tag, or has nested tags (probably audio)
        }
		    if (nextSibling.tagName == "P") {
          siblings.push(nextSibling);
        }
        nextSibling = nextSibling.nextElementSibling;
	    }
	    return siblings;
    },

    parseSentenceProduction: function(card, children) {
      var card = {
        'type': "SENTENCE_PRODUCTION",
        'hanzi': '',
        'english': '',
        'keyword': null,
        'audio': [],
        'images': [],
        'notes': [],
        'usage': [],
        'characters': [],
        'source lesson': null,
        'tags': card.tags,
        'top-down': [],
        'word': "",
      };

      for (var idx in children) {
        idx = parseInt(idx);
        let child = children[idx];

        let mark_elm = child.getElementsByTagName("mark")[0];
        if (mark_elm != undefined) {
          card.word = mark_elm.textContent;
        }

        if (child.tagName == "H2" && idx == 0) {
          card.english = child.textContent;
          let siblings = this.getSiblings(child);
          for (let sib of siblings) {
            if (sib.textContent.match(/^[AB]:/) ) {
   	          card.english += " " + sib.textContent;
      	    }
          }
        }
        else if (child.tagName == "H2" && idx > 0) { // it's the chinese phrase
          card.hanzi = child.textContent;
          let siblings = this.getSiblings(child);

          if (children[idx+1].textContent.length > 0) {
            if (children[idx+1].getElementsByTagName("mark")[0]) {
              card.hanzi += children[idx+1].textContent;
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
          for (let propelm of child.children) {
            if (!propelm.textContent || propelm.textContent == "Characters:") { continue }
            let textContent = propelm.textContent.trim();
            if (textContent == "Untitled") {
              let splits = propelm.getElementsByTagName('a')[0].getAttribute("href").split("/");
              textContent = splits[splits.length-1];
            }
            card.characters.push(textContent);
          }
        }
        else {
          this.attachAudio(card, child);
        }
      }
      if (card.characters && !card.word) {
        card.word = card.characters.join("");
      }
      this.attachNotes(card);
      return card;
    },

    parseProp: function(card, children) {
      var card = {
        'type': card.type,
        'component': '',
        'tags': card.tags,
        'notes': [],
        'images': [],
        'source lesson': null,
      };

      for (let child of children) {
        if (child.textContent.startsWith("Pick a prop for")) { card.component = child.textContent.split("Pick a prop for")[1].trim(); }
      }
      let edit_fields = document.getElementsByClassName("group/editor")
      for (let elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-prop") > 0) {
          if (elm.textContent.length > 0) {
            card.notes.push(elm.textContent);
          }
          for (let img of elm.getElementsByTagName("img")) {
            card.images.push(img.getAttribute('src'));
          }
        }
      }
      return card;
    },

    parseSet: function(card, children) {
      var card = {
        'type': card.type,
        'pinyinfinal': '',
        'notes': [],
        'tags': card.tags,
      };
      for (let child of children) {
        if (child.textContent.startsWith("Pick a set for")) { card.pinyinfinal = child.textContent.split("Pick a set for")[1].trim(); }
      }
      var edit_fields = document.getElementsByClassName("group/editor")
      for (let elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-set") > 0) {
          if (elm.textContent.length > 0) {
            card.notes.push(elm.textContent);
          }
        }
      }
      return card;
    },

    parseActor: function(card, children) {
      var card = {
        'type': card.type,
        'pinyininitial': '',
        'notes': [],
        'tags': card.tags,
      };
      for (let child of children) {
        if (child.textContent.startsWith("Pick an actor for")) { card.pinyininitial = child.textContent.split("Pick an actor for")[1].trim(); }
      }
      var edit_fields = document.getElementsByClassName("group/editor")
      for (let elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-actor") > 0) {
          if (elm.textContent.length > 0) {
            card.notes.push(elm.textContent);
          }
        }
      }
      return card;
    },

    parseWordConnection: function(card, children) {
      var card = {
        'type': card.type,
        'hanzi': null,
        'keyword': null,
        'pinyin': null,
        'audio': [],
        'notes': [],
        'images': [],
        'tags': card.tags,
      };
      for (let idx in children) {
        idx = parseInt(idx);
        let child = children[idx];

        if (child.textContent.startsWith("Meaning") || child.textContent.startsWith("English")) {
          card.keyword = children[idx+1].textContent;
        }
        else if (child.textContent.startsWith("Pinyin")) {
          card.pinyin = children[idx+1].textContent;
        }
        else if (child.textContent.startsWith("Word connection:")) {
          card.hanzi = child.textContent.split("Word connection:")[1].trim();
        }
        else if (child.textContent.startsWith("Word:")) {
          card.hanzi = child.textContent.split("Word:")[1].trim();
        }
        else {
          this.attachAudio(card, child);
        }
      }
      let edit_fields = document.getElementsByClassName("group/editor");
      for (let elm of edit_fields) {
        if (elm.textContent && elm.getAttribute('id').toLowerCase().indexOf("field-lived") > 0) {
          if (elm.textContent.length > 0) {
            card.notes.push(elm.textContent);
          }
        }
        if (elm.getAttribute('id').toLowerCase().indexOf("field-image") > 0) {
          for (let img of elm.getElementsByTagName("img")) {
            card.images.push(img.getAttribute('src'));
          }
        }
      }
      return card;
    },

    parseMovie: function(card, children) {
      var card = {
        'type': "MOVIE",
        'hanzi': "",
        'keyword': null,
        'pinyin': null,
        'audio': [],
        'actor': null,
        'set': null,
        'props': [],
        'notes': [],
        'source lesson': null,
        'tags': card.tags,
        'top-down': [],
        'word': "",
      };

      for (let idx in children) {
        idx = parseInt(idx);
        let child = children[idx];
        if (child.textContent.startsWith("Movie review")) {
          card.hanzi = child.textContent.split("Movie review:")[1].trim();
        }
        if (child.textContent.startsWith("Keyword")) { card.keyword = children[idx+1].textContent; }
        else if (child.textContent.startsWith("Pinyin")) { card.pinyin = children[idx+1].textContent; }
        else if (child.textContent.startsWith("Actor")) {
          if (child.textContent.startsWith("Actors:")) {
            card.actor = children[idx].textContent.split("Actors:")[1].trim();
          }
          else {
            card.actor = children[idx].textContent.split("Actor:")[1].trim();
          }
        }
        else if (child.textContent.startsWith("Set")) { card.set = children[idx].textContent.split("Set:")[1].trim(); }
        else if (child.textContent.startsWith("Prop(s)") || child.textContent.startsWith("Props")) {
          let remaining = children.slice(idx);
          remaining.forEach(propelm => {
            let propValue = propelm.textContent.replace('Prop(s):', '').replace("Props:", "").trim();
            if (propelm.getElementsByTagName('a').length == 0) {
              ;
            } else {
              let propHtml = propelm.getElementsByTagName('a')[0].getAttribute('href');
              card.props.push(`${propValue}`); // (<a href="https://traverse.link${propHtml}">Traverse Link</a>)`);
            }
          });
        }
        else {
          this.attachAudio(card, child);
        }
      }
      this.attachNotes(card);
      card.image = [`https://dragonmandarin.com/media/hanzi5-${card.hanzi}.gif`];
      return card;
    },
  };


  var UI = {
    createFlash: function(message, timeout, warning) {
      let toolbar = document.getElementsByClassName('MuiToolbar-regular')[0];
      if (warning) { var button_class = "skip-button-container"; }
      else { var button_class = "add-to-reviews-button-container"; }
      let html = `<button id="success-icon-yay" class="homescreen-button learn-mode-button-container {{ button_class }}" style="padding-right: 5px; padding-left: 5px; position: absolute; right: 0px; top: 58px; max-width: max-content; cursor: default; min-height: 50px; height: fit-content;">{{ message }}</button>`;
      let rendered = Handlebars.compile(html)({button_class: button_class, message: message});
      UI.appendHtml(toolbar.getElementsByClassName('homescreen-button')[0].parentNode, rendered);
      window.setTimeout(() => { document.getElementById("success-icon-yay").remove() } , timeout || 1500);
    },

    setDeckName: function(settingsName, field) {
      let settingsCtx = SETTINGS.DEFAULTS[settingsName];
      let config_key = settingsCtx.CONFIG_KEY;
      let miningDeck = SETTINGS.getConfig(config_key, settingsCtx[field]);
      var deck = prompt("Enter deck name (it will be created it Anki, if it does not exist)", miningDeck);
      if (!deck) {
        deck = miningDeck;
      }
      SETTINGS.setConfig(config_key, deck);
    },

    appendHtml: function(el, str) {
      var div = document.createElement('div');
      div.innerHTML = str;
      while (div.children.length > 0) {
        el.appendChild(div.children[0]);
      }
    },

    changeAnkiModel: function(settingsCtx, value) {
      console.log(settingsCtx);
//       SETTINGS.setConfig(config_key, value.target.value);
      console.log(value.target.name, value.target.value);
    },

    createSettingsEditor: function() {
      if (document.getElementById("t2asettings")) return;

      console.log('[T2A] creating settings editor');
      let settings_html = `
<div id="t2asettings" class="flex-1 border rounded-mb overflow-y-auto">
	<div class="bg-white h-full">
  	<div class="reveal-card dark:bg-gray-900 dark:text-white">
    	<div class="reveal-prompt">
      	<div id="revealed-editor" class="group/editor dark:bg-gray-900", style="position: relative; width: 100%;">
        	<div class="add-reviews-surface">
          	<button id="killButton" class="learn-mode-button-container skip-button-container" style="right: 0px; position: absolute;">Close</button>

          </div>
        </div>
      </div>
    </div>
  </div>
</div>`;

      let div = createElement("div", "t2asettings", "flex-1 border rounded-md overflow-y-auto");
      let bg_white_div = createElement("div", null, "bg-white h-full");
      div.appendChild(bg_white_div);
      let revealCard = createElement("div", null, "reveal-card dark:bg-gray-900 dark:text-white");
      bg_white_div.appendChild(revealCard);
      let revealPrompt = createElement("div", null, "reveal-prompt");
      revealCard.appendChild(revealPrompt);
      let editor = createElement("div", "revealed-editor", "group/editor dark:bg-gray-900", "position: relative; width: 100%;");
      revealPrompt.appendChild(editor);

      let buttonContainer = createElement("div", "", "add-reviews-surface-2 reveal-surface-2");
      editor.appendChild(buttonContainer);

      let killButton = createElement("button", "killButton", "learn-mode-button-container skip-button-container", "right: 0px; position: absolute;", " Close ");
      buttonContainer.appendChild(killButton);
      killButton.onclick = function() { document.getElementById("t2asettings").remove(); }


      function createSettingsSection(settingsTitle, settingsName, settingsCtx, sectionId) {
        var anki_fields = [];

        ANKI.getAnkiFields(settingsCtx.MODEL).then( (fields) => {
          anki_fields = fields
        }).then( () => {

      	  let section_template = `
<H1 class="field-name">{{ settingsTitle }}</h1>
<div class="field-name">{{ settingsName }}</div>
<div id="{{ settingsName }}-div">
	<select id="{{ settingsName }}-models">
    {{#each models as |model| }}
    {{#ifEquals model ../selectedModel }}
    <option value="{{model}}" selected>{{model}}</option>
    {{else}}
  	<option value="{{model}}">{{model}}</option>
    {{/ifEquals}}
    {{/each}}
  </select>
</div>
`;
          let templ = Handlebars.compile(section_template);
          let rendered = templ( { settingsTitle: settingsTitle, settingsName: settingsName, models: SETTINGS.ANKI_MODELS, selectedModel: settingsCtx.MODEL } );
          UI.appendHtml(editor, rendered);
          createFieldSettings(settingsCtx, anki_fields, `${settingsName}-div`, sectionId);

          document.getElementById(`${settingsName}-models`).onchange = function(event) { UI.changeAnkiModel(settingsCtx, event) };

        });
      };

      function createFieldSettings(settingsCtx, anki_fields, anchorId, sectionId) {
        let html_template = `
<div id ="{{ settings.MODEL}}-options-container">
	<table>
  	<tr>
    	<th>Field in Anki</th>
      <th>Field scraped from Traverse</th>
    </tr>
  {{#each options as |option| }}
  	<tr>
    	<td style="min-width: 200px;">
    		<label for="{{../model }}_{{ this }}" >{{ this }}</label>
      </td>
      <td>
        <select name="{{../model }}_{{ this }}" id="{{../model }}_{{ this }}">
          {{#each ../settings.FIELDS }}
          {{#ifEquals @key option }}
          <option value="{{this}}" selected>{{this}}</option>
          {{ else }}
          <option value="{{this}}">{{this}}</option>
          {{/ifEquals}}
          {{/each}}
        </select>
      </td>
    </tr>
    {{/each}}
  </table>
</div>`;

        let tmpl = Handlebars.compile(html_template);
        let rendered = tmpl( { model: sectionId, settings: settingsCtx, options: anki_fields } );
        UI.appendHtml(document.getElementById(anchorId), rendered);

        for	(var anki_field of anki_fields) {
          document.getElementById(`${sectionId}_${anki_field}`).onchange = function(event) { UI.changeAnkiModel(settingsCtx, event) };
        }
      };

      createSettingsSection("Sentence Settings", "Select Sentence Model", SETTINGS.DEFAULTS.SENTENCE, "SENTENCE");


// 			window.setTimeout(() => createSettingsSection("Sentence Production Settings", "Select Sentence Production Model", SETTINGS.DEFAULTS.SENTENCE_PRODUCTION), 50);
// 			window.setTimeout(() => createSettingsSection("Character/Set/Prop/Actor Settings", "Select Model", SETTINGS.DEFAULTS.MOVIE), 50);

      var anchor = document.getElementsByClassName('h-full w-full pt-16 flex-col md:flex-row')[0];
      anchor.appendChild(div);
    },

    createStopButton: function() {
      let html = `<button id="stopauto" class="homescreen-button cue-button review-due-button onboarding-review-due button-glow" title="Stop automation">Stop Auto</button>`;
      UI.appendHtml(document.getElementsByClassName('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit')[0].parentNode, html);
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
        if (event.target.matches('#t2amenu') ) { document.getElementById("myDropdown").classList.toggle('show'); }
        if (event.target.matches("#characterdeck") ) { UI.setDeckName("MOVIE", "DECK"); }
        if (event.target.matches("#sentencedeck") ) { UI.setDeckName("SENTENCE", "DECK"); }
        if (event.target.matches("#sentenceproductiondeck") ) { UI.setDeckName("SENTENCE_PRODUCTION", "DECK"); }
        if (event.target.matches("#levelauto") ) { Traverse.automateLevel(); }
        if (event.target.matches("#fulllevelauto") ) { Traverse.enqueueLevel(); }
        if (event.target.matches("#stopauto") ) { Traverse.stopAutomation(); }
        if (event.target.matches("#aplusplus") ) { Traverse.parseTraverseAndAdd(); }
//        if (event.target.matches("#settings") ) { UI.createSettingsEditor(); }

      });

      let menu_html = `
<a id="aplusplus" class="homescreen-button cue-button review-due-button onboarding-review-due button-glow" title="Add open card to Anki">Anki++</a>
<div class="dropdown">
	<button id="t2amenu" class="homescreen-button text-black dark:text-white dropbtn" title="Traverse 2 Anki Settings">T2A</button>
	<div id="myDropdown" class="dropdown-content">
  	<a id="characterdeck" title="Set Character Deck (also used for props, actors, sets, words)">Character Deck Name</a>
    <a id="sentencedeck" title="Set Sentence Deck">Sentence Deck Name</a>
    <a id="sentenceproductiondeck" title="Set Sentence Production Deck">SentenceProduction Deck Name</a>
<!--    <a id="settings" title="Settings">Settings</a> -->

    <a id="levelauto" title="Create Anki cards from open level, starting with the selected node">Automagic</a>
    <a id="fulllevelauto" title="Automate a full level (Intermediate and up). Open the level, be on the top-level and click this!">Full Level Auto
    	<span style="padding-left:5px;"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-repeat" viewBox="0 0 16 16"><path d="M11 5.466V4H5a4 4 0 0 0-3.584 5.777.5.5 0 1 1-.896.446A5 5 0 0 1 5 3h6V1.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384l-2.36 1.966a.25.25 0 0 1-.41-.192m3.81.086a.5.5 0 0 1 .67.225A5 5 0 0 1 11 13H5v1.466a.25.25 0 0 1-.41.192l-2.36-1.966a.25.25 0 0 1 0-.384l2.36-1.966a.25.25 0 0 1 .41.192V12h6a4 4 0 0 0 3.585-5.777.5.5 0 0 1 .225-.67Z"/>
</svg></span>
    </a>
  </div>
</div>`;
      UI.appendHtml(document.getElementsByClassName('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit')[0].parentNode, menu_html);
      console.log('[T2A] download button created');
    },
  };

  console.log("[T2A] LOADED");

  if (SETTINGS.ANKI_MODELS.length === 0) {
    ANKI.getAnkiModels().then( models => {
      SETTINGS.ANKI_MODELS = models;
    }).then( () => {
      ANKI.createModels();
    });
  }
//   SETTINGS.migrateConfig();

//     // --- MutationObserver (No changes) ---
  const observerCallback = function(mutationsList, observer) {
    const avatar = document.getElementsByClassName("MuiAvatar-root MuiAvatar-circular MuiAvatar-colorDefault");
    const buttonNode = document.getElementById('t2amenu');
    if (document.location.href.indexOf("/Mandarin_Blueprint/") > 0 && avatar[0] && !buttonNode) {
      Handlebars.registerHelper('ifEquals', function(arg1, arg2, options) {
        return (arg1 == arg2) ? options.fn(this) : options.inverse(this);
      });
      UI.createMenu();
    }
  };
  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, { childList: true, subtree: true });

})();
