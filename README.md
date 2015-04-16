# StatBot
A chat bot and web tools for League of Legends

## Purpose

The purpose of this project is to demonstrate how I work as well as build a useful tool for the community.

## What is it?

This project includes several components.

### LoLHubot

A hubot instance configured to connect to the Riot XMPP network. It also uses some custom scripts to enable other users on the XMPP network, LoL players, to send chat commands and get meaningful responses.

Built using: 

* Hubot
* Coffeescript


### WebApp

The codebase that serves the web interface. The web app provides a way to manage the settings that the chat interface uses. While the chat interface can configure these things, a web application provides a more useable interface. 

The WebApp will work as a LoL xmpp client allowing visitors to log in to chat with their LoL friends without having the full game client open. [Need to check into the rules for being a chat client]

Everything served by the web app will be served via HTTPS.

The application is built using the following tools:

* Meteor
* CSS - LESS
* HTML - jade?
* Javascript - Ecmascript 6
* XMPP

### MobileApp

The codebase to build the mobile application. It provides basically the same functionality as `WebApp`.

### 
