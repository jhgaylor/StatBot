# Description:
#   A report of champions to counter another champion
#
# Commands:
#   counter <champion_name> - Reply with a list of recommended counters to a given champion. The data comes from championselect.net **Options:**  --verbose (-v): show more results**  --lane (-l): valid values ['all', 'general', 'jungler', 'mid', 'bottom' 'top']

module.exports = (robot) ->
  robot.hear /COUNTER /i, (msg) ->
    argv = robot.optionParser msg.message.text.split(' '),
      alias:
        verbose: "v"
        lane: "l"
      boolean: ["verbose"]
      string: ["lane"]
    champion_name = argv._[1]
    lane = argv.lane
    unless champion_name
      # TODO: output the help text for this command
      msg.send "Please specify a champion name. ie `counter annie`"
      return

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

    user = msg.message.user
    # track an event with optional properties
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: "counter"
      text: msg.message.text
      user_id: user.id
      summoner_name: user.summoner_name
      champion_name: champion_name

    queryObj =
      champion_name: champion_name
    if lane
      queryObj.lane = lane
    msg.send "http://championselect.net/champ/#{champion_name}"
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    # console.log "region #{region}"
    api_url = "http://#{API_FQDN}/commands/counters"
    console.log(api_url)
    robot.http(api_url)
      .query(queryObj)
      .get() (err, res, body) ->
        unless err
          data = JSON.parse body
        if err || data.error
          console.log "Error getting counters", (err || data.error)
          msg.send "I'm sorry. I couldn't find this information."
          return;

        counters = data.data
        unless argv.verbose
          counters = counters.slice(0,5);
        counters.forEach (counter) ->
          msg.send "#{counter.name} - #{counter.lane} - Up: #{counter.upvotes} Down: #{counter.downvotes}"
