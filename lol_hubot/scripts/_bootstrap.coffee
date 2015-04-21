_ = require('underscore')
ltx = require 'ltx'
logentries = require('le_node')
module.exports = (robot) ->
  # attach logentries logger
  robot.log = logentries.logger
    token: process.env.LOGENTRIES_API_KEY
  robot.log.level("debug")
  robot.log.debug "Logger attached to robot."
  # Attach mixpanel to the robot
  MixpanelLib = require('mixpanel')
  # create an instance of the mixpanel client
  mixpanel_api_key = process.env.STATBOT_MIXPANEL_KEY
  if mixpanel_api_key
    robot.mixpanel = MixpanelLib.init(mixpanel_api_key)
    robot.log.debug "Mixpanel attached to robot."
  # attach minimist, an option parser to the robot
  robot.optionParser = require('minimist');
  robot.log.debug "Option parser attached to robot."
  # Send a presence to a user after it subscribes to the bot (friends it)
  # Without this the bot would have to be restarted to let new friends know it is online
  # move the old function
  robot.adapter._readPresence = robot.adapter.readPresence
  # wrap it in something to send the necessary presence to be seen online
  robot.adapter.readPresence = (stanza) ->
    if stanza.attrs.type is "subscribe"
      robot.log.info "Received subscribe presence. Got a new friend :)"
      # TODO: record the friending somewhere where we can annotate it a bit better (summoner_name)
      #   as well as record a successful referral if it was one
      # tracks a mixpanel event of gaining a friend
      robot.mixpanel and robot.mixpanel.track "lolhubot:friend",
        user_id: stanza.attrs.from

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
    robot.log.info(users_data)
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
        robot.log.error "Error getting list champions", err || data.error
        return;
      CHAMPIONS_NAMES = data.data;

  # attach the fuzzy matcher
  fuzzy = require('fuzzy')
  robot.fuzzyFilter = (str) ->
    results = fuzzy.filter(str, CHAMPIONS_NAMES);
    return results.map (res) ->
      return res.string
