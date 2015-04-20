# Description:
# 	Interacts with the Riot Games API to return a list of free champions
#
# Commands:
#   free - Reply with a list of free champions from NA
#		free <region> - Reploy with a list of free champions for a given region. Valid regions include br, eune, euw, kr, lan, las, na, oce, ru, tr

module.exports = (robot) ->
  robot.hear /^FREE/i, (msg) ->
    argv = robot.optionParser msg.message.text.split(' '),
      alias:
        region: "r"
    region = argv.region || argv._[0]
    user = msg.message.user
    # track an event with optional properties
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: "free"
      user_id: user.id
      summoner_name: user.summoner_name
      region: region
    msg.send "Free Champs:"
    # TODO: this process of making an http request to the statbotapi server
    #  needs to be more dry
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    # console.log "region #{region}"
    api_url = "http://#{API_FQDN}/commands/free"
    console.log(api_url)
    robot.http(api_url)
      .query({
        region: region
      })
      .get() (err, res, body) ->
        unless err
          data = JSON.parse body
        if err || data.error
          console.log "Error getting free champions", err || data.error
          msg.send "I'm sorry. I couldn't find this information."
          return;
        console.log(body, data);
        msg.send "#{data.data.join(', ')}"
