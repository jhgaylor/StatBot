# Description:
# 	Interacts with the Riot Games API to return a list of free champions
#
# Commands:
#   free - Reply with a list of free champions from NA
#		free <region> - Reploy with a list of free champions for a given region

module.exports = (robot) ->
  robot.hear /^FREE\s*(.*)?$/i, (msg) ->
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
