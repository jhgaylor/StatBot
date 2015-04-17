Q = require 'q'
request = require 'request'
_ = require('underscore');

DataSources = require('./DataSources');
# use redis + expire
# args needs to be kwargs (opts) so that it can be passed 
#   all over the place and every body know how to use the object
# need to cache the raw data from responses (json/html) or the data structure i want used or both?

class Command
  constructor: (@data_sources=[], @buildFn) ->
    # set up the object for run to be called

  getDataSource: (name, opts) ->

  getDataSources: (args) ->
    # returns a hashtable of data_source keys w/ a promise for its data
    # accounts for 'keys.like.this' for {keys:{like:{this: new DataSource()}}}
    # the data_source key will be undefined is the lookup failed
    sources = {}
    @data_sources.forEach (source_key) ->
      keys = source_key.split('.')
      location = null;
      for key in keys
        if location
          location = location[key]
          if ! location
            # if the new location is undefined, the DataSource doesn't exist
            return
        else
        location = DataSources
      # set the value to the promise to return the data
      sources[source_key] = location.get(args)

  run: (opts) ->
    return @buildFn(opts)


# NOTE: For each data_source listed, there will be a key accessible in
#   the builderFn.  Only list a data_source if builder depends directly on the data
#   Do NOT list subdeps
Commands = 
  stats: do ->
    new Command ['riot.ranked_stats'],
      (args) ->
        # build the data structure that should be send from the API to the caller
        # context will be set to the command
        # now have access to the data_sources by @getDataSources(args) which will return a hashtable of {data_source_name: promise}
        # each build function is responsible for waiting for the data sources to load.


r = DataSources.teemojson_free_champions.get({a:5})
r.then (val) ->
  console.log "R1 #{val}"

id_promise = DataSources.riot.summoner_id.get
  summoner_name: "igetkills"
  region: "na"

id_promise.then (data) ->
  console.log "id: #{data}"

stats_promise = DataSources.riot.ranked_stats.get(
  summoner_name: "igetkills"
).then (data) ->
  console.log "stats: #{data}"

module.exports = Command