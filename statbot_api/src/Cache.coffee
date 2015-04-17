redis = require 'redis'
Q = require 'q'
Cache = ->
  return {
    client: do ->
      # client = redis.createClient(6379, '127.0.0.1', {})
      client = redis.createClient()
      client.on "error", (err) ->
        console.log "Redis client threw error: #{err}"
        throw err
      client
    get: (key) ->
      deferred = Q.defer()
      @client.get key, (err, val) ->
        deferred.resolve(val)
      deferred.promise
    set: (key, value, timeout=0) ->
      deferred = Q.defer()
      # console.log key, value, timeout
      @client.set key, value, (err) =>
        if timeout > 0
          @client.expire key, timeout, (err) ->
            deferred.resolve(true)
      deferred.promise

    quit: ->
      @client.quit()
  }

module.exports = Cache