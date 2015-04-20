# Description:
#   A list of useful links regarding a champion
#
# Commands:
#   links <champion_name> - Reply with useful urls

module.exports = (robot) ->
  robot.hear /^(links |l )/i, (msg) ->
    argv = robot.optionParser msg.message.text.split(' '),
      alias:
        verbose: "v"
      boolean: ["verbose"]
    user = msg.message.user
    command = argv._[0]
    champion_name = argv._[1]

    # track an event with optional properties
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: "links"
      text: msg.message.text
      user_id: user.id
      summoner_name: user.summoner_name
      champion_name: champion_name
    msg.send "http://championselect.net/champ/#{champion_name}"
    msg.send "http://champion.gg/champion/#{champion_name}"
    msg.send "http://www.solomid.net/guide?champ=#{champion_name}"
    msg.send "http://www.probuilds.net/champions/#{champion_name}"
    msg.send "http://www.mobafire.com/league-of-legends/#{champion_name}-guide"
    msg.send "http://www.lolbuilder.net/#{champion_name}"
    if argv.verbose
      msg.send "http://www.lolpro.com/guides/#{champion_name}"
      msg.send "http://www.lolking.net/champions/#{champion_name}"
      msg.send "http://www.elophant.com/league-of-legends/champion/#{champion_name}/stats"
      msg.send "http://leagueoflegends.wikia.com/wiki/#{champion_name}"
      msg.send "http://lol.esportspedia.com/wiki/#{champion_name}"
