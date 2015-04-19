# LoLHubot

This is a version of GitHub's Campfire bot, hubot. He's pretty cool. This incarnation of Hubot is made to communicate w/ Riot Games' XMPP network.

[Scripting Guide](https://github.com/github/hubot/blob/master/docs/scripting.md).

Uses the XMPP adapter.

### Required Environment variables

In addition to those listed in the dockerfile, these environment variables should be set

`HUBOT_XMPP_USERNAME` - League of Legends login name with "@pvp.net/xiff" appended to it. Example: `statbot@pvp.net/xiff`

`HUBOT_XMPP_PASSWORD` - League of Legends password with "AIR_" prepended to it. Example "AIR_apple"

`STATBOT_MIXPANEL_KEY` - Used for tracking usage data.

### Expected Links

The docker container expects to be linked to a redis instance interally known as `redis`.
