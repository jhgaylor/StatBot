# Description:
#
#
# Commands:
#   best <handle> - return the champions with the highest win/loss ratio for a player. **Options:**  --season: one of [2015, 2014, 3]**  --region: country code**  --verbose (-v): List all champions w/l record in descending order

_ = require 'underscore'

module.exports = (robot) ->

  robot.hear /^best (\w*)/i, (msg) ->
    # use minimist to parse the command using the power
    # of a full blown option parser
    argv = robot.optionParser msg.message.text.split(' '),
      alias:
        region: "r"
        season: "s"
        verbose: "v"
      boolean: ["verbose"]

    command = argv._[0]
    summoner_name = argv._[1]
    champion_name = argv._[2]
    region = argv.region
    season = argv.season
    verbose = argv.verbose

    unless summoner_name
      # TODO: output the help text for this command
      msg.send "Please specify a summoner name. ie `stats igetkills`"
      return

    # only do the fuzzy matching if the parameter is provided
    if champion_name
      console.log("here")
      # TODO: oh man is this not dry...
      fuzzy_champion_name_matches = robot.fuzzyFilter(champion_name);
      if fuzzy_champion_name_matches.length is 0
        msg.send "The name you entered does not match a LoL champion."
        return
      if fuzzy_champion_name_matches.length > 1
        msg.send "The name you entered matched multiple LoL champions."
        msg.send "Did you mean:"
        msg.send fuzzy_champion_name_matches.join(', ')
        return
      # if there is exactly 1 match, set it
      if fuzzy_champion_name_matches.length is 1
        champion_name = fuzzy_champion_name_matches[0]

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
      champion_name: champion_name
      region: region
      season: season

    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    api_url = "http://#{API_FQDN}/commands/best"

    robot.http(api_url)
      .query(queryObj)
      .get() (err, res, body) ->
        if (err)
          console.log "got an err", err
          msg.send "I've experienced difficulties fulfilling your request."
          return;
        console.log "body", body
        champions = JSON.parse(body).data
        unless verbose
          champions = champions.slice(0, 5)
        champions.forEach (champ, index) ->
          msg.send "#{index} - #{champ.name} #{champ.winRate}% #{champ.wins+champ.losses}"

    msg.send "Getting stats for #{summoner_name}"

