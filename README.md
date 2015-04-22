# StatBot
A chat bot and web tools for League of Legends

Live

NA - StatBot
OCE - StatBot
EUW - StatPal

## Purpose

The purpose of this project is to demonstrate how I work as well as build a useful tool for the community. It will be developed entirely in the open. Check the wiki for writeups describing the process, use the issue tracker to ask questions or report bugs, use pull requests to suggest fixes or add features.

## What is it?

This project includes several components. Each component is documented further in its respective home.

### LoLHubot

A hubot instance configured to connect to the Riot XMPP network. It also uses some custom scripts to enable other users on the XMPP network, LoL players, to send chat commands and get meaningful responses.

Built using: 

* Hubot
* Hubot-xmpp
* Coffeescript


### WebApp

The codebase that serves the web interface. The web app provides a way to manage the settings that the chat interface uses. While the chat interface can configure these things, a web application provides a more useable interface. 

The WebApp will work as a LoL xmpp client allowing visitors to log in to chat with their LoL friends without having the full game client open. [Need to check into the rules for being a chat client]

Everything served by the web app will be served via HTTPS.

The application is built using the following tools:

* Meteor
* CSS - LESS
* HTML - jade?
* Javascript - Ecmascript5
* Bootstrap 3
* XMPP

### MobileApp

The codebase to build the mobile application. It provides basically the same functionality as `WebApp`.

### StatBotAPI

An application that serves the network APIs used by all the user facing applications. It provides a common end point for processing commands. This lets the codebase remain DRY. 

This serves HTTP and WS apis. The HTTP api is used to receive commands from clients like `WebApp`, `MobileApp`, and `LoLHubot`.  The WS api is used to proxy XMPP connections and stream data.

Built using:

* node - Ecmascript5
* express.js
* websockets
