# Description:
#   Utility commands surrounding Hubot uptime.
#
# Commands:
#   ping - Reply with pong

module.exports = (robot) ->
  robot.hear /^PING$/i, (msg) ->
    msg.send "PONG"
