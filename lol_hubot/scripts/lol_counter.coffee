# Description:
#   Utility commands surrounding Hubot uptime.
#
# Commands:
#   counter - Reply with a url to championselect.net

# TODO: how can i make this DRY?
Mixpanel = require('mixpanel')
# create an instance of the mixpanel client
mixpanel_api_key = process.env.STATBOT_MIXPANEL_KEY
if mixpanel_api_key
  mixpanel = Mixpanel.init(mixpanel_api_key)

module.exports = (robot) ->
  robot.hear /COUNTER (.*)$/i, (msg) ->
    user = msg.message.user
    # track an event with optional properties
    mixpanel and mixpanel.track("lolhubot:command", {
      command: "counter"
      text: msg.message.text
      user_id: user.id
    })
    champion_name = msg.match[1]
    msg.send "http://championselect.net/champ/#{champion_name}"
