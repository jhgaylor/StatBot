# Description:
#   Utility commands surrounding Hubot uptime.
#
# Commands:
#   hubot ping - Reply with pong
#   hubot echo <text> - Reply back with <text>
#   hubot time - Reply with current time
#   hubot die - End hubot process

module.exports = (robot) ->
  robot.hear /PING$/i, (msg) ->
    msg.send "PONG"
    

  robot.hear /ECHO (.*)$/i, (msg) ->
    msg.send msg.match[1]

  robot.hear /TIME$/i, (msg) ->
    msg.send "Server time is: #{new Date()}"

  robot.hear /DIE$/i, (msg) ->
    msg.send "Goodbye, cruel world."
    process.exit 0

