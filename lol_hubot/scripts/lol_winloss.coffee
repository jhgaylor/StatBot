# Description:
#   Utility commands surrounding Hubot uptime.
#
# Commands:
#   winloss - Broken!!!

# processes the api response body and sends the appropriate message
#########BROKEN

# _ = require 'underscore'

# module.exports = (robot) ->

#   robot.hear /^stats (\w*) ?(\w*)$/i, (msg) ->
#     summoner_name = msg.match[1]
#     champion_name = msg.match[2]
#     query_string = 
#       summoner: summoner_name
#       champion_name: champion_name

#     robot.http("http://localhost:3000/commands/stats")
#       .query(query_string)
#       .get() (err, res, body) ->
#         data = JSON.parse(body).data
#         unless data.wins or data.losses
#           msg.send "Incomplete data found for #{msg.match[1]}"
#           return
        
#         wins = data.wins
#         losses = data.losses
#         win_percentage = ((wins/(wins+losses))*100).toFixed(2)
#         msg.send "Total: #{wins+losses}  Wins: #{wins}  Losses: #{losses}"
#         msg.send "Win Percentage: #{win_percentage}%"

#     msg.send "Getting stats for #{summoner_name}"
#     