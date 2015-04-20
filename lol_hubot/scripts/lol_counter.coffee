# Description:
#   A report of champions to counter another champion
#
# Commands:
#   counter <champion_name> - Reply with a list of recommended counters to a given champion. The data comes from championselect.net **Options:**  --verbose (-v): show more results**  --lane (-l): *future*

module.exports = (robot) ->
  robot.hear /COUNTER /i, (msg) ->
    argv = robot.optionParser msg.message.text.split(' '),
      alias:
        verbose: "v"
      boolean: ["verbose"]

    champion_name = argv._[1]
    unless champion_name
      # TODO: output the help text for this command
      msg.send "Please specify a champion name. ie `links annie`"
      return

    user = msg.message.user
    # track an event with optional properties
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: "counter"
      text: msg.message.text
      user_id: user.id
      summoner_name: user.summoner_name
      champion_name: champion_name
    msg.send "http://championselect.net/champ/#{champion_name}"
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    # console.log "region #{region}"
    api_url = "http://#{API_FQDN}/commands/counters"
    console.log(api_url)
    robot.http(api_url)
      .query({
        champion_name: champion_name
      })
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
