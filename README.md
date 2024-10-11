# Traverse Exporter

This tool allows you to download all your notes for all cards that are open in a Traverse graph.
Why Does This Project Exist?

Traverse is a proprietary and closed platform, with extremely limited/non-existing options to configure and tinker.
This tool allows a user to create Anki cards based on information available to the user from Traverse with 1 click per card.

The tool:
* exports the required card info, character, keyword, notes
* downloads associated audio (technically Anki does this for you)
* fetches a stroke order gif from a third party website  (technically Anki does this for you)


The tool does not:
* access any information you do not already have full access to.


Please do not:
* be a jerk and publish the extracted cards anywhere.

# Limitations

Only supports character cards. No current support for sentence or prop cards or other cards, such as TPV, MSLK, Pronunciation Mastery, etc.

Sentence and props may come later.

TPV/MSLK/etc. may come even later.

# Installation

## Prerequisites:

* Firefox or Chrome/Chromium/Edge
* GreaseMonkey extension for Firefox, TamperMonkey extension for Chrome/Chromium/Edge
* A valid user account on Traverse
* Anki with AnkiConnect installed (see this page for installation: https://foosoft.net/projects/anki-connect/)
* You must have a deck type called 'MOVIE REVIEW' available Anki. If you've previously installed an MB Anki deck at least once, it should be there.
* You must have a deck called `Mining`, it is currently hardcoded into the script to add new cards to this deck. May provide option to configure later.



## Installing the Tool:

* Open the following user script: https://github.com/soborg/travToAnki/raw/refs/heads/main/travToAnki.user.js
* A prompt should appear automatically, click Install to install.


# Using the Tool:

* Anki must be running. AnkiConnect must be enabled.
* Open Traverse and open a card you'd like to add to Anki, an 'Anki++' button should appear top-right.
* Click the button, a green checkmark should flash briefly if it succeeded.
* Verify in your Anki `Mining` deck that the new card is added. If it's not, something's broken, create an issue or contact me if you know my contact details.


## Loop

* add a bunch of cards from Traverse.
* rename the deck, or move the cards to other decks as you please.
* if the former, create a new deck called 'Mining'.
* repeat until you've exhausted the cards in Traverse: congratulations!



# Liability

This tool allows you to create personal copies of the information available to you in Traverse, this is in accordance with the Mandarin Blueprint Terms of Use.
Do not violate the Terms of Use of Mandarin Blueprint and do not infringe on their copyright.

I am not liable for any use or misuse of this tool.
