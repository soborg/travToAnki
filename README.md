
# Quickstart/Usage

* Anki must be running. AnkiConnect must be enabled.
* Open Traverse and a deck/note (an `Anki++` button should appear, otherwise somethings wrong, make an issue!).

Note: Exported notes are unsuspended by default, suspend them manually if you don't want to review them just yet.

## Adding a single note

* Click the button, a green box should flash briefly if it succeeded.
* Verify in your Anki `Mining` deck (or whatever name you selected in the `T2A` menu).


## Adding a bunch of notes

For example, all regular notes from level 16.

- Open level 16
- Click `T2A` menu, then click `Automagic`

It'll add all (remaining) cards starting from the one you have selected, one by one. So if you have the first card selected, it'll add the whole list (it doesn't descent into sub-decks, e.g. Sentence decks).


## Adding a complete level for Intermediate and beyond (MSLK and TPV very soon)

- open the level, e.g. level 42
- make sure you're at the top-level, there should be a number of sub-decks visible
- open `T2A` and click `Full Level Auto`

It'll add all cards the cards from that level, one by one. May take between an hour, hour and a half, depending on the amount of cards to extract.

It's recommended to refresh Traverse before continuing with other levels (clears the active cache). The more you use and navigate Traverse the slower it becomes.


## Changing Target Decks

- Open `T2A` menu and enter a name for
  - `Character Deck Name` changes target deck for these note types: `sets`, `actors`, `props`, `characters`, `vocab`
  - `Sentence Deck Name` changes target deck for these note types: `sentences`
  - `SentenceProduction Deck Name` changes target deck for these note types: `sentence active recall`

Deck names are automatic for all other types.

Use `AUTO` as deck name to let the script do it automatically.

Use `My MB::AUTO` to let it automatically create decks under the `My MB` master deck.

Decks will be created automatically if they do not already exist.


# Changelog

## V2.4.4 (2025-12-13)
- more stable deck name auto-generation.


## v2.4.1 (2025-12-07)
- \[full auto mode\]  sentence lists named, 语境. (e.g. `58级 - 语境. # 1531 - 1540`) are now correctly identified and enqueued.


## v2.4 (2025-12-03)

- add full-auto mode for creating cards for a complete level (Intermediate and beyond). Navigate to an Intermediate (or above) level, be sure to stay on the top-level, then use the 'Full Level Auto' to let it collect a complete level.
- will attempt to create target decks in Anki if it doesn't already exist.
- Use `AUTO` in the target deck name to let the script autodetect. For example `Master::AUTO` for cards in the `771-780` section of level 42, will put the card into this target deck: `Master::Phase 6 - Intermediate (37-58)::Level 42::771-780`.
- images should now be properly included for vocab and sentence notes.
- attempts to self-heal sentences when the keyword is not highlighted in the sentence. (it'll still be highlighted correctly in Anki)
- better detection of which parts of the Traverse cards goes into Top-Down Words and Usage sections of the created Anki card.
- better detection of Production and Recall sentence cards.


## V2.3 (2025-11-25)

- Improve automation stability, add a stop button to stop processing further. Delay between each card in this process is up to 12 seconds, to account for Traverse's exceptionally slow loading of note assets/links.
- add support for sentence production cards (download latest example.apkg to get the character note type into your Anki).
- improved card type detection. Should now correctly detect and add notes for every card type in the core curriculum.
- option to use separate decks for "regular" notes (props,movies,sets,actors), sentence notes, and sentence production notes.
- MSLK/TPV note detection seems to work, (no stable support yet).

This version has been battle tested with everything from Phase 1, 2, and 3.


## v2.2 (2025-09-21)

- \[EXPERIMENTAL\] Simple **automation**! Open a level of your choice, click the T2A-menu -> Automagic. It'll create all cards for that level with a single click.
- fixing issue with not recognizing word connection cards correctly (they were incorrectly classified as sentences).

# Installation

## Prerequisites

You must have:

* Firefox or Chrome/Chromium/Edge on PC/Mac
* GreaseMonkey extension for Firefox, TamperMonkey extension for Chrome/Chromium/Edge
* A user account on Traverse
* Anki with AnkiConnect installed (see this page for installation: https://foosoft.net/projects/anki-connect/)


### Special settings if you're using Chrome

- In Anki AnkiConnect settings (`Tools -> Add-ons -> click AnkiConnect -> Config`), add `"https://traverse.link"` to `webCorsOriginList` list. Complete config should be as follows, assuming nothing else was previously changed:

```json
{
    "apiKey": null,
    "apiLogPath": null,
    "ignoreOriginList": [],
    "webBindAddress": "127.0.0.1",
    "webBindPort": 8765,
    "webCorsOriginList": [
        "http://localhost",
        "https://traverse.link",
        "https://killergerbah.github.io"
    ]
}
```


## Installing the Tool

* Open the following user script: https://github.com/soborg/travToAnki/raw/refs/heads/main/travToAnki.user.js
* A prompt should appear automatically, click Install.
* Install the `example.apkg` example deck into your Anki to get the required notes (https://github.com/soborg/travToAnki/raw/refs/heads/main/example.apkg)
* Open Traverse and verify there's an `Anki++` button when you enter a specific deck/level.

# Liability

Do not violate the Terms of Use of Mandarin Blueprint and do not infringe on their copyright.

Excerpt from https://www.mandarinblueprint.com/terms-and-conditions/

```
These Terms of Service permit you to use the Service for your personal, non-commercial use only.
You must not reproduce, distribute, modify, create derivative works of,
publicly display, publicly perform, republish, download, store or transmit any of the material on our Service,
except as follows:

   * Your computer may temporarily store copies of such materials in RAM incidental to your accessing and viewing those materials.
   * You may store files that are automatically cached by your Web browser for display enhancement purposes.
   * You may download one copy of Content for your own personal, non-commercial use and not for further reproduction, publication or distribution.
   * If we provide desktop, mobile or other applications for download, you may download a single copy to your computer
     or mobile device solely for your own personal, non-commercial use, provided you agree to be bound by our end user license agreement for such applications.
```
(October 2024)


The developer(s) of this tool can not be held liable for any use or misuse of this tool.


# But Why All This?!

Traverse bad, Anki good.
