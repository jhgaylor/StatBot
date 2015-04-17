# LoLHubot

This is a version of GitHub's Campfire bot, hubot. He's pretty cool. This incarnation of Hubot is made to communicate w/ Riot Games' XMPP network.

[Scripting Guide](https://github.com/github/hubot/blob/master/docs/scripting.md).

Uses the XMPP adapter.

### Required Environment variables

In addition to those listed in the dockerfile, these environment variables should be set

`HUBOT_XMPP_USERNAME` - League of Legends login name with "@pvp.net/xiff" appended to it. Example: `statbot@pvp.net/xiff`

`HUBOT_XMPP_PASSWORD` - League of Legends password with "AIR_" prepended to it. Example "AIR_apple"

### Deploying to UNIX or Windows

If you would like to deploy to either a UNIX operating system or Windows.
Please check out the [deploying hubot onto UNIX][deploy-unix] and
[deploying hubot onto Windows][deploy-windows] wiki pages.

[heroku-node-docs]: http://devcenter.heroku.com/articles/node-js
[deploy-heroku]: https://github.com/github/hubot/blob/master/docs/deploying/heroku.md
[deploy-unix]: https://github.com/github/hubot/blob/master/docs/deploying/unix.md
[deploy-windows]: https://github.com/github/hubot/blob/master/docs/deploying/unix.md

