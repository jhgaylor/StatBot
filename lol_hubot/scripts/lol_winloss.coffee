# Description:
#   Utility commands surrounding Hubot uptime.
#
# Commands:
#   stats <handle> - return the win/loss ratio for a player
#   stats <handle> <champion> - return the win/loss ratio for a player and champion

# processes the api response body and sends the appropriate message


_ = require 'underscore'

module.exports = (robot) ->

  robot.hear /^stats (\w*) ?(\w*)? ?(\w*)$/i, (msg) ->
    summoner_name = msg.match[1]
    champion_name = msg.match[2]
    user = msg.message.user
    # track an event with optional properties if mixpanel was initialized
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: command
      user_id: user.id
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    # TODO: how to do unordered, optional parameters. i dont want to have to
    #   set a champion to set a season or region
    season = msg.match[3]
    region = msg.match[4]
    api_url = "http://#{API_FQDN}/commands/stats"

    robot.http(api_url)
      .query({
        summoner: summoner_name
        champion_name: champion_name
        region: region
        season: season
      })
      .get() (err, res, body) ->
        if (err)
          console.log "got an err", err
          return;
        console.log "body", body
        data = JSON.parse(body).data
        unless data.wins or data.losses
          msg.send "Incomplete data found for #{msg.match[1]}"
          return

        wins = data.wins
        losses = data.losses
        win_percentage = data.winRate
        msg.send "Total: #{wins+losses}  Wins: #{wins}  Losses: #{losses}"
        msg.send "Win Percentage: #{win_percentage}%"

    msg.send "Getting stats for #{summoner_name}"

