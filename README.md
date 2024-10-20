# Traverse To Anki Exporter

This tool allows you to selectively export character and sentence cards from Traverse to Anki.

## Why though?

Traverse is a proprietary and closed platform, with extremely limited options to configure and tinker.

* It uses an adaptation of the SuperMemo-2 algorithm. This algorithm is ancient, much better algorithms exist (like the FSRS algorithm which is natively available in newer versions of Anki).
* UI/UX is poor and resource heavy. Once you get past a few hundred cards, the UI becomes sluggish and annoying, even on high-end PCs.
* no offline mode.
* Poor support on mobile devices.

Anki is an Open Source platform with near infinite possibilites. You can change most things exactly to your liking and best of all: you *OWN* your own data.

Anki has a massive supportive and active community. Traverse has a tiny team and a very fragmented community. In the broader language learning community, nobody knows what Traverse is, almost everyone knows what Anki is.


## What is this tool?

The tool allows you to:
* export Traverse cards/notes, including personal notes, images, top-down words (for sentences), etc.
* fetches a stroke order gif from a third party website (technically Anki does this for you)


The tool does not:
* access any information you do not already have full access to.


Please do not:
* be a jerk and publish the extracted cards anywhere.

# Limitations

Only supports character and sentence cards.

# Installation

## Prerequisites:

* Firefox or Chrome/Chromium/Edge
* GreaseMonkey extension for Firefox, TamperMonkey extension for Chrome/Chromium/Edge
* A user account on Traverse
* Anki with AnkiConnect installed (see this page for installation: https://foosoft.net/projects/anki-connect/)
* You must the deck types called `MOVIE REVIEW` (for characters) and `MB CLOZE` (for sentencse) available in Anki. If you've previously installed an MB Anki deck at least once, they should be there.
* You must have a deck called `Mining`, it is currently hardcoded into the script to add new cards to this deck. The `Mining` deck can be nested beneath other decks. May provide option to configure later.


## Installing the Tool:

* Open the following user script: https://github.com/soborg/travToAnki/raw/refs/heads/main/travToAnki.user.js
* A prompt should appear automatically, click Install to install.


# Using the Tool:

* Anki must be running. AnkiConnect must be enabled.
* Open Traverse and open a card you'd like to add to Anki, an `Anki++` button should appear top-right after a few seconds.
* Click the button, a green checkmark should flash briefly if it succeeded.
* Verify in your Anki `Mining` deck that the new note is added. If it's not, something's broken, create an issue or contact me if you know my contact details.

Exported notes are unsuspended by default, suspend them manually in the Browse-menu.


## Loop

* add a bunch of cards from Traverse.
* rename the deck, or move the cards to other decks as you please.
* if the former, create a new deck called 'Mining'.
* repeat until you've exhausted the cards in Traverse: congratulations!


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
