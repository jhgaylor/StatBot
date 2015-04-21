# Description:
#   Allows you to have StatBot send another summoner a friend request
#
# Commands:
#   refer <summoner_name> - StatBot will attempt to friend the summoner
ltx = require 'ltx'
module.exports = (robot) ->
  robot.hear /^refer /i, (msg) ->
    argv = robot.optionParser msg.message.text.split(' ')
    summoner_name =  argv._[1]
    unless summoner_name
      msg.send "Please specify a summoner to friend. ie `refer igetkills`"
    user = msg.message.user
    # track an event with optional properties
    robot.mixpanel and robot.mixpanel.track "lolhubot:command",
      command: "refer"
      user_id: user.id
      summoner_name: user.summoner_name
      target_summoner_name: summoner_name
    msg.send "Processing referral..."
    # TODO: this process of making an http request to the statbotapi server
    #  needs to be more dry
    API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
    # console.log "region #{region}"
    api_url = "http://#{API_FQDN}/commands/summoner_id"
    console.log(api_url)
    robot.http(api_url)
      .query({
        summoner_name: summoner_name
      })
      .get() (err, res, body) ->
        unless err
          data = JSON.parse body
        if err || data.error
          console.log "Error getting summoner id", err || data.error
          msg.send "I'm sorry. I couldn't find the summoner #{summoner_name}."
          return;
        # console.log(body, data);
        summoner_id = data.data
        # console.log(robot.adapter.client.send, ltx)
        presenceObj = new ltx.Element 'presence',
          from: "sum50580562@pvp.net",
          to: "sum#{summoner_id}@pvp.net/xiff",
          name: "StatBot",
          type: 'subscribe'
        robot.adapter.client.send(presenceObj)
        # TODO: log this referal in persistent storage
        robot.mixpanel and robot.mixpanel.track "lolhubot:referral",
          user_id: user.id
          summoner_name: user.summoner_name
          target_summoner_name: summoner_name
          target_summoner_id: summoner_id
        msg.send "Friend request sent."
