# Installation

## Prerequisites

You must have:

* Firefox or Chrome/Chromium/Edge on PC/Mac
* GreaseMonkey extension for Firefox, TamperMonkey extension for Chrome/Chromium/Edge
* A user account on Traverse
* Anki with AnkiConnect installed (see this page for installation: https://foosoft.net/projects/anki-connect/)
* You must the deck types called `MOVIE REVIEW` (for characters) and `MB CLOZE` (for sentences) available in Anki. If you've previously installed an MB Anki deck at least once, they should be there.
* You must have a deck called `Mining`, it is currently hardcoded into the script to add new notes to this deck. May add option to configure later.


## Installing the Tool

* Open the following user script: https://github.com/soborg/travToAnki/raw/refs/heads/main/travToAnki.user.js
* A prompt should appear automatically, click Install to install.


# Using the Tool

* Anki must be running. AnkiConnect must be enabled.
* Open Traverse and open a card you'd like to add to Anki, an `Anki++` button should appear top-right after a few seconds.
* Click the button, a green checkmark should flash briefly if it succeeded.
* Verify in your Anki `Mining` deck that the new note is added (you may have to click the `Mining` deck in the Browse menu to refresh). If it's not, something's broken, create an issue or contact me if you know my contact details.

Exported notes are unsuspended by default, suspend them manually if you don't want to review them just yet.


## Work Flow

* add a bunch of cards from Traverse.
* rename the deck, or move the cards to other decks as you please.
* if the former, create a new deck called 'Mining'.
* repeat until you're done.


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
