statbot-server
==============

Serves the statbot clients (LoLHubot, WebApp, MobileApp).

The runtime should be ECMAScript6 Harmony.

### Environment Variables not in the Dockerfile

`LOL_API_KEY` - An API key from [Riot Games](https://developer.riotgames.com/)

`STATBOT_CACHE_HOST` - The hostname of a redis instance to be used for a memory cache. Default: `127.0.0.1`

`STATBOT_CACHE_PORT` - The port of a redis instance to be used for a memory cache coresponding to `STATBOT_CACHE_HOST`. Default: `6379`

`STATBOT_MIXPANEL_KEY` - Used for tracking usage data.