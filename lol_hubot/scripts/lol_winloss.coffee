# Description:
#   Utility commands surrounding Hubot uptime.
#
# Commands:
#   stats <handle> [<champion>] - return the win/loss ratio for a player [and champion]. **Options:**  --season: one of [2015, 2014, 3]**  --region: country code

_ = require 'underscore'

module.exports = (robot) ->

  robot.hear /^stats (\w*)/i, (msg) ->
    # use minimist to parse the command using the power
    # of a full blown option parser
    argv = robot.optionParser msg.message.text.split(' '),
      alias:
        region: "r"
        season: "s"

    command = argv._[0]
    summoner_name = argv._[1]
    champion_name = argv._[2]
    region = argv.region
    season = argv.season

    queryObj =
      summoner_name: summoner_name
      champion_name: champion_name
    if region
      queryObj.region = region
    if season
      queryObj.season = season

    user = msg.message.user
    # track an event with optional properties if mixpanel was initialized
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: command
      user_id: user.id
      summoner_name: user.summoner_name

    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    api_url = "http://#{API_FQDN}/commands/stats"

    robot.http(api_url)
      .query(queryObj)
      .get() (err, res, body) ->
        if (err)
          console.log "got an err", err
          msg.send "I've experienced difficulties fulfilling your request."
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

