# Description:
# 
#
# Commands:
#   free - Reply with a list of free champions for NA

module.exports = (robot) ->
  robot.hear /^FREE$/i, (msg) ->
    msg.send "Free Champs:"
    API_HOST = process.env.API_PORT_3000_TCP_ADDR
    api_url = "http://#{API_HOST}/commands/free"
    console.log(api_url)
    robot.http(api_url)
      .get() (err, res, body) ->
        data = JSON.parse body
        console.log(body, data);
        msg.send "#{data.data.join(', ')}"
