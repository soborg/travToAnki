// ==UserScript==
// @name     Traverse Export To Anki
// @version  1
// @grant        unsafeWindow
// @grant        GM.setValue
// @grant        GM.getValue
// @match        https://traverse.link/Mandarin_Blueprint/*
// ==/UserScript==

(function() {
  console.log("hello world");
	var cards = [];

  var ok_icon = "data:image/gif;base64,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";
 
  function anki_invoke(action, version, params={}) {
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
	};
  
  function createNote(card) {
    var audio_fields = [];
//     var document_level = document.getElementsByClassName("text-lg text-black")[0].textContent.match(/\d+/)[0];
    var document_level = document.getElementsByClassName("max-h-full")[0].textContent.match(/\d+/)[0];
    var level_tag = "MBMLEVEL"+document_level;
		var image_url = `https://dragonmandarin.com/media/hanzi5-${card["hanzi"]}.gif`
    var image_filename = `hanzi5-${card["hanzi"]}.gif`;
    var notes = `ACTOR: ${card["actor"]}<br/>

SET: ${card["set"]}<br/>

PROPS: ${card["props"]}<br/>
<br/>

NOTES: ${card["notes"].join("<br/>")}
`;

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
            "deckName": "Mining",
            "modelName": "MOVIE REVIEW",
            "fields": {
                "HANZI": card["hanzi"],
                "KEYWORD": card["keyword"],
                "PINYIN": card["pinyin"],
                "NOTES": notes
            },
            "options": {
                "allowDuplicate": true,
                "duplicateScope": "deck",
                "duplicateScopeOptions": {
                    "deckName": "Default",
                    "checkChildren": false,
                    "checkAllModels": false
                }
            },
            "tags": [
                "soborg",
              	level_tag,
              	"4-MAKE-A-MOVIE"
            ],
            "audio": audio_fields,
            "picture": [{
                "url": image_url, //"https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/A_black_cat_named_Tilly.jpg/220px-A_black_cat_named_Tilly.jpg",
                "filename": image_filename,
                "skipHash": "",
                "fields": [
                    "STROKE ORDER"
                ]
            }]
        }
    };

    console.log(card);
    console.log(params);
    
    anki_invoke('addNote', 6, params).then(result => {
	    createSuccess();
    });

  };
  
  function createSuccess() {
    var add_button = document.createElement('img');
    add_button.textContent = '';
    add_button.setAttribute("id", "success-icon-yay");
    add_button.setAttribute("style", "padding-right: 0px; padding-left: 0px; position: absolute; right: 0px; top: 58px; max-width: 58px;");
    add_button.setAttribute("src", ok_icon);
    var anchor = toolbar.getElementsByClassName('homescreen-button')[0].parentNode;
    anchor.appendChild(add_button);

    function removeSuccess() {
      document.getElementById("success-icon-yay").remove();
    };
    window.setTimeout(removeSuccess, 2500);
  };
  
  function parseTraverseCard() {
    var htmlchildren = document.getElementsByClassName("ProseMirror")[0].children;
    children = [];
		for (var idx in htmlchildren) {
      var child = htmlchildren[idx];
      if (!child.textContent) {
        continue
      }
      children.push(child);
    }
    
    card = {
      'type': null,
      'hanzi': null,
      'keyword': null,
      'pinyin': null,
      'audio': [],
      'actor': null,
      'set': null,
      'props': [],
      'notes': [],
    };
		var edit_fields = document.getElementsByClassName("group/editor")
    for (var idx in edit_fields) {
      var elm = edit_fields[idx];
      if (elm.textContent && elm.getAttribute('id').indexOf("NOTES") > 0) {
        if (elm.textContent.length > 0) {
        	card['notes'].push(elm.textContent);
        }
      }
    }
    	
    
    for (var idx in children) {
      idx = parseInt(idx);
      var child = children[idx];
      if (!child.textContent) {
        continue
      }

      if (child.textContent.startsWith("Movie review")) {
        card['type'] = 'movie review';
        card['hanzi'] = child.textContent.split("Movie review:")[1].trim();
      }

      if (card['type'] == 'movie review') {
        if (child.textContent.startsWith("Keyword")) { card["keyword"] = children[idx+1].textContent; }
        else if (child.textContent.startsWith("Pinyin")) { card["pinyin"] = children[idx+1].textContent; }
//        else if (idx == 5) { // audio

//        }

        else if (child.textContent.startsWith("Actor")) { card['actor'] = children[idx].textContent.split("Actor:")[1].trim(); }
        else if (child.textContent.startsWith("Set")) { card['set'] = children[idx].textContent.split("Set:")[1].trim(); }
        else if (child.textContent.startsWith("Prop(s)")) {
          card['props'].push(child.textContent.split("Prop(s):")[1].trim());
          var remaining = children.slice(idx+1);
          for (var emidx in remaining) {
            var propelm = remaining[emidx];
          	card['props'].push(propelm.textContent.trim());
          }
        }
        else {
          var audio_elms = child.getElementsByTagName('audio');
          for (var audidx in audio_elms) {
            var le_elm = audio_elms[audidx];
            if (!le_elm.textContent) {
              continue;
            }
            card['audio'].push(le_elm.getAttribute('src'));
          }
        }
      }
    }
    if (card['type']) {
      console.log('card added: ', card['type']);
      createNote(card);
    }
		return card;
  };

  function createDownloadButton() {
    var toolbars = document.getElementsByClassName('MuiToolbar-regular');
    if (toolbars.length == 0) {
      console.log("No toolbar found, can not attach download button");
      return
    }
		toolbar = toolbars[0];
    GM.setValue('cards', []);
    var add_button = document.createElement('button');
    add_button.textContent = 'Anki++';
    add_button.classList.toggle('homescreen-button');
    add_button.setAttribute('title', 'Add open card to Anki');
    add_button.addEventListener('click', parseTraverseCard, false);
	
    var anchor = toolbar.getElementsByClassName('MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit')[0].parentNode; // homescreen-button')[0].parentNode;
    anchor.appendChild(add_button);
    console.log('download button created');
  };


  unsafeWindow.we_are_there = false;
  function areWeThereYet() {
    if (document.location.href.indexOf("/Mandarin_Blueprint/") > 0) {
      if (!unsafeWindow.we_are_there) { 
        createDownloadButton();
      	console.debug("yay");
      	unsafeWindow.we_are_there = true;
      }
    } else {
      unsafeWindow.we_are_there = false;
      console.debug("nay");
    }
  }
	console.log("LOADED?!?!");
  window.setInterval(areWeThereYet, 5000); // occasional check to see if we're in the right spot

})();
