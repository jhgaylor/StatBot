# Description:
#   Utility commands surrounding Hubot uptime.
#
# Commands:
#   counter - Reply with a url to championselect.net


module.exports = (robot) ->
  robot.hear /COUNTER (.*)$/i, (msg) ->
    champion_name = msg.match[1]
    msg.send "http://championselect.net/champ/#{champion_name}"
