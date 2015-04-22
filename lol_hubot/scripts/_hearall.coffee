# This script does things that need to be done on any command received.

# an object of all the user ids we've talked to this boot. for sending a default message
greeted = {}
module.exports = (robot) ->
  # get the user's summoner name into cache for easier lookups
  robot.hear /.*$/i, (msg) ->
    # information identifying the user who sent the message
    local_user = msg.message.user

    # if we've not greeted this user this boot
    unless greeted[local_user.id]
      msg.send "Welcome user. Send me a message with just the word help and I'll tell you everything I can do."
      greeted[local_user.id] = true
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
