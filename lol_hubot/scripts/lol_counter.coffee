# Description:
#   A report on champions to counter other champions
#
# Commands:
#   counter - Reply with a url to championselect.net

module.exports = (robot) ->
  robot.hear /COUNTER /i, (msg) ->
    argv = robot.optionParser msg.message.text.split(' ')
    champion_name = argv._[1]

    user = msg.message.user
    # track an event with optional properties
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: "counter"
      text: msg.message.text
      user_id: user.id
      summoner_name: user.summoner_name
      champion_name: champion_name
    msg.send "http://championselect.net/champ/#{champion_name}"
