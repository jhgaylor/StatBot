# Description:
# 
#
# Commands:
#   free - Reply with a list of free champions for NA

module.exports = (robot) ->
  robot.hear /^FREE$/i, (msg) ->
    msg.send "Free Champs:"
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    api_url = "http://#{API_FQDN}/commands/free"
    # api_url = "http://localhost:3000/commands/free"
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
