# Description:
#   Interacts with na.gg to get an overview of the current game
#
# Commands:
#   intel <summoner_name> - Reply with intel about the game summoner_name is currently in. **Options:**  --region (-r): country codes

module.exports = (robot) ->
  robot.hear /^intel /i, (msg) ->
    argv = robot.optionParser msg.message.text.split(' '),
      alias:
        region: "r"
    command = argv._[0]
    summoner_name = argv._[1]
    region = argv.region

    user = msg.message.user
    # track an event with optional properties if mixpanel was initialized
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: command
      user_id: user.id
      summoner_name: user.summoner_name
      region: region
    msg.send "Intel:"
    # TODO: this process of making an http request to the statbotapi server
    #  needs to be more dry
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    # console.log "region #{region}"
    api_url = "http://#{API_FQDN}/commands/intel"
    console.log(api_url)
    robot.http(api_url)
      .query({
        region: region,
        summoner_name: summoner_name
      })
      .get() (err, res, body) ->
        unless err
          data = JSON.parse body
        if err || data.error
          console.log "Error getting intel", err || data.error
          msg.send "I'm sorry. I couldn't find this information."
          return;
        # console.log(data);
        [{name: "Team One", data: data.data.teamOne}, {name: "Team Two", data: data.data.teamTwo}].forEach (obj) ->
          msg.send "#{obj.name} - #{obj.data.mmr}"
          obj.data.summoners.forEach (summoner) ->
            carry = ""
            if summoner.carry
              carry = "**carry**"
            msg.send "#{carry} #{summoner.name} | #{summoner.current_rank} | Ranked - #{summoner.ranked_win_ratio}W #{summoner.ranked_games_played} games"
            msg.send "--- Champ - KDA: #{summoner.champion_kda} #{summoner.champion_win_ratio}W #{summoner.champion_games} games"
