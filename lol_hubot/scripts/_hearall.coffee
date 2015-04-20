# This script does things that need to be done on any command received.

module.exports = (robot) ->
  # get the user's summoner name into cache for easier lookups
  robot.hear /.*$/i, (msg) ->
    # information identifying the user who sent the message
    local_user = msg.message.user
    # need a reference to the user stored on the brain to make changes persist
    user = robot.brain.userForId(local_user.id)

    # if the user's summoner_name isn't known
    unless user.summoner_name
      target_id = user.id.slice(3)
      # retrieve the summoner_name from the api server and store it in the brain
      API_FQDN = process.env.API_ENV_TUTUM_SERVICE_FQDN
      api_url = "http://#{API_FQDN}/getSummonerNameById"
      robot.http(api_url)
        .query({summoner_id: target_id})
        .get() (err, res, body) ->
          if err
            console.log "Error identifying summoner by id", target_id, err
            return
          data = JSON.parse body
          console.log("received", data)
          user.summoner_name = data.data.summoner_name
