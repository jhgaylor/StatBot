# Description:
# 
#
# Commands:
#   free - Reply with a list of free champions for NA

module.exports = (robot) ->
  robot.hear /^FREE$/i, (msg) ->
    msg.send "Free Champs:"
    robot.http("http://localhost:3000/commands/free")
      .get() (err, res, body) ->
        data = JSON.parse body
        msg.send "#{data.data.join(', ')}"
