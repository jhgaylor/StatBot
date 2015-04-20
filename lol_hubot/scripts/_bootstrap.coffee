_ = require('underscore')
module.exports = (robot) ->
  # Attach mixpanel to the robot
  MixpanelLib = require('mixpanel')
  # create an instance of the mixpanel client
  mixpanel_api_key = process.env.STATBOT_MIXPANEL_KEY
  if mixpanel_api_key
    robot.mixpanel = MixpanelLib.init(mixpanel_api_key)

  # attach minimist, an option parser to the robot
  robot.optionParser = require('minimist');

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
