var Command = require('./Command');

var _ = require('underscore')
var Q = require('q');
// NOTE: For each data_source listed, there will be a key accessible in
//   the builderFn.  Only list a data_source if builder depends directly on the data
//   Do NOT list subdeps
Commands = {
  free: Command(['riot.free_champions'], function (opts, dataSourceGetters) {
    // build the data structure that should be send from the API to the caller
    // now have access to the data source values by calling getDataSourceGetters(options) which will return a promise for the data in that source
    // each build function is responsible for waiting for the data sources to load.
    var champions_promise = dataSourceGetters['riot.free_champions']({
      region: opts.region
    });
    var results_promise = champions_promise.then(function (champs) {
      // Do any formatting here
      return champs;
    });
    return results_promise;
  }),
  win_loss: Command(['riot.ranked_stats', 'riot.static_champions_data'], function (opts, dataSourceGetters) {
    console.log(opts)
    var stats_promise = dataSourceGetters['riot.ranked_stats'](opts);
    var champions_data_promise = dataSourceGetters['riot.static_champions_data'](opts);
    // wait for all data sources and call a handler to
    var results_promise = Q.all([stats_promise, champions_data_promise])
      .spread(function (statsPerChampion, lookups){
        // console.log("command received", statsPerChampion, lookups);
        var champions = [];
        var wins = 0;
        var losses = 0;

        if(opts.champion_name) {
          // only calculate the stats for the champion in question
          championId = lookups.lookupByName[opts.champion_name];
          if (! championId) {
            return {error: "Invalid champion name provided"};
          }
          // find the champion matching the id from the stats
          var champ = _.find(statsPerChampion, function (el) {
            return el.id == championId
          });
          if (champ) {
            wins = champ.stats.totalSessionsWon
            losses = champ.stats.totalSessionsLost
          }
        } else {
          // calculate stats for all champions
          _.each(statsPerChampion, function (champion, championId) {
            // TODO: take into consideration champion_name if set
            _.each(champion.stats, function (val, key, obj) {
              if (key === "totalSessionsWon") {
                wins += val;
              }

              if (key === "totalSessionsLost") {
                losses += val;
              }
            });
          });
        }

        return {
          wins: wins,
          losses: losses,
          winRate: ((wins/(wins+losses))*100).toFixed(2)
        };
      });
    return results_promise;
  }),
}


module.exports = Commands
