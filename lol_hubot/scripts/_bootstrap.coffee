_ = require('underscore')
ltx = require 'ltx'
module.exports = (robot) ->
  # Attach mixpanel to the robot
  MixpanelLib = require('mixpanel')
  # create an instance of the mixpanel client
  mixpanel_api_key = process.env.STATBOT_MIXPANEL_KEY
  if mixpanel_api_key
    robot.mixpanel = MixpanelLib.init(mixpanel_api_key)

  # attach minimist, an option parser to the robot
  robot.optionParser = require('minimist');
  # { name: 'presence',
  # parent: null,
  # attrs:
  #  { to: 'sum50580562@pvp.net/xiff',
  #    from: 'sum50580562@pvp.net/xiff',
  #    type: 'available',
  #    'xmlns:stream': 'http://etherx.jabber.org/streams' },
  # children: [] }
  # move the old function
  robot.adapter._readPresence = robot.adapter.readPresence
  # wrap it in something to send the necessary presence to be seen online
  robot.adapter.readPresence = (stanza) ->
    if stanza.attrs.type is "subscribe"
      console.log "received a subscribe. this is where you log a referral being accepted."
      presence = new ltx.Element 'presence',
        from: stanza.attrs.to
        to:   stanza.attrs.from
      robot.adapter.client.send(presence)
    robot.adapter._readPresence(stanza)

  # Log out info about connected users every minute
  logUserData = ->
    users = robot.brain.users()
    users_data = _.map users, (e, i) ->
      return {
        id: i
        name: e.summoner_name
      }
    console.log(users_data)
  logUserData()
  setInterval(logUserData, 60000)

  # grab the champion names from the api server
  CHAMPIONS_NAMES = []
  API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
  # console.log "region #{region}"
  api_url = "http://#{API_FQDN}/commands/champions_names"
  console.log(api_url)
  robot.http(api_url)
    .get() (err, res, body) ->
      unless err
        data = JSON.parse body
      if err || data.error
        console.log "Error getting list champions", err || data.error
        return;
      CHAMPIONS_NAMES = data.data;

  # attach the fuzzy matcher
  fuzzy = require('fuzzy')
  robot.fuzzyFilter = (str) ->
    results = fuzzy.filter(str, CHAMPIONS_NAMES);
    return results.map (res) ->
      return res.string
