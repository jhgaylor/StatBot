Q = require 'q'
request = require 'request'
_ = require 'underscore'
DataSource = require './DataSource'

Cache = require('./Cache')()
# NOTE: remember to clean up the cache connection
setTimeout ->
  console.log "cache quit"
  Cache.quit()
, 5000

LoL = require 'lol-api'
LoL.configure process.env.LOL_API_KEY

ONE_HOUR = 3600
ONE_DAY = ONE_HOUR * 24
ONE_WEEK = ONE_DAY * 7
DataSources =
  teemojson_free_champions: do ->
    new DataSource 'teemojson_free_champions', ONE_HOUR, Cache,
      (opts) ->
        # grabs the free champion list from an unofficial api
        # use opts to make an http request and return some data
        # do async work and resolve a promise
        deferred = Q.defer()
        region = opts.region || "na"
        url = "https://teemojson.p.mashape.com/service-state/#{region}/free-week"
        request_options = 
          url: url
          headers:
            "X-Mashape-Authorization": "liyxg1azbxb73dzzegavcpfmz1d1a6"

        request request_options, (err, resp, body) ->
          if err
            console.log "Encountered an error :( #{err}"
            deferred.reject(err)
          else
            # process the data
            data = JSON.parse(body)
            champs = _.without(_.values(data.data.free), null)
            deferred.resolve(champs)

        return deferred.promise
  riot:
    summoner_id: do ->
      new DataSource 'riot_summoner_id', ONE_WEEK, Cache,
        (opts) ->
          deferred = Q.defer()
          summoner_name = opts.summoner_name
          region = opts.region || "na"
          LoL.summonerByName summoner_name, 'na', (data) ->
            # TODO: err if no summoner id found
            id = data and data[summoner_name].id
            deferred.resolve id
          return deferred.promise


    ranked_stats: do ->
      new DataSource 'riot_ranked_stats', ONE_HOUR, Cache,
        (opts) ->
          deferred = Q.defer()
          summoner_name = opts.summoner_name
          region = opts.region || "na"

          summoner_id_promise = RIOT_SUMMONER_ID.get(
            summoner_name: summoner_name
            region: region
          ).then (id) ->
            # now actually go grab the ranked stats
            console.log "--ID: #{id}"
            LoL.statsRanked id, region, (ranked_stats) ->
              deferred.resolve(ranked_stats)

          return deferred.promise

module.exports = DataSources