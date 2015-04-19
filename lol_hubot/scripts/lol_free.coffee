# Description:
# 	Interacts with the Riot Games API to return a list of free champions
#
# Commands:
#   free - Reply with a list of free champions from NA
#		free <region> - Reploy with a list of free champions for a given region. Valid regions include br, eune, euw, kr, lan, las, na, oce, ru, tr

# TODO: how can i make this DRY?
Mixpanel = require('mixpanel')
# create an instance of the mixpanel client
mixpanel_api_key = process.env.STATBOT_MIXPANEL_KEY
if mixpanel_api_key
	mixpanel = Mixpanel.init(mixpanel_api_key)

module.exports = (robot) ->
  robot.hear /^FREE\s*(.*)?$/i, (msg) ->
    user = msg.message.user
    # track an event with optional properties
    mixpanel and mixpanel.track("lolhubot:command", {
      command: "free"
      user_id: user.id
    })
    msg.send "Free Champs:"
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    region = msg.match[1] || "na"
    # console.log "region #{region}"
    api_url = "http://#{API_FQDN}/commands/free?region=#{region}"
    console.log(api_url)
    robot.http(api_url)
      .get() (err, res, body) ->
        if err
          console.log "Error getting free champions", err
          msg.send "I'm sorry. I couldn't find this information."
          return;
        data = JSON.parse body
        console.log(body, data);
        msg.send "#{data.data.join(', ')}"
