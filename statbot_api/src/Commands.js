var Command = require('./Command');

var _ = require('underscore')
var Q = require('q');

// serverside implementation of the jQuery api
var cheerio = require('cheerio');
// NOTE: For each data_source listed, there will be a key accessible in
//   the builderFn.  Only list a data_source if builder depends directly on the data
//   Do NOT list subdeps
Commands = {
  intel: Command(['opgg.overview'], function (opts, dataSourceGetters) {
    var overviewPromise = dataSourceGetters['opgg.overview'](opts)
    return overviewPromise
      .then(function (html) {
        var $ = cheerio.load(html);
        // console.log($('.Time.gameDate'));
        function processTable (selector) {
          var $table = $(selector);
          var $summonerRows = $table.find('tbody tr');
          var $teamRow = $table.find('thead tr');
          var raw_mmr = $teamRow.find('td:first-child').text();
          // something is weird in bans, i think it's encoded
          // var $bans = $teamRow.find('td.BannedChampions dd');
          // $bans.map(function (i, el) {
          //   console.log("_", $(el).html());
          // })
          // .map(function (i, el) {
          //   $el = $(el);
          //   console.log("!", Object.keys($el));
          //   return $el.attr('original-title');//.split(' ')[0]
          // }).get();
          var teamInfo = {
            mmr: raw_mmr && raw_mmr.trim().split(':')[1].trim(),
            // bans: bans,
            summoners: $summonerRows.map(function (i, el) {
              // el is tr.Champion
              $el = $(el);
              var previousRankImgUrl = $el.find('td.PreviousTierRank img').attr('src');
              if(previousRankImgUrl) {
                var parts = previousRankImgUrl.split('/');
                var fullFileName = parts[parts.length-1];
                var fileName = fullFileName.split('.')[0];
                var previousRankName = fileName.replace('_', " ");
              }
              return {
                name: $el.find('.SummonerName a').text(),
                spells: $el.find('.championSpell .spell img').map(function (i, el) {
                  var url = $(el).attr('src');
                  if(! url){
                    return;
                  }
                  var parts = url.split('/');
                  var fullFileName = parts[parts.length-1];
                  var fileName = fullFileName.split('.')[0];
                  var spellName = fileName.replace('Summoner', "");
                  return spellName;
                }).get(),
                carry: !! $el.find('td.CarryPower i.icon-bolt').length,
                current_rank: $el.find('td.TierRank').text().split("(")[0].trim(),
                previous_rank: previousRankName,
                ranked_win_ratio: $el.find('td.WinRatio .ratio').text(),
                ranked_games_played: $el.find('td.WinRatio span').text().split(" ")[0].replace("(", "").trim(),
                champion_kda: $el.find('td.ChampionInfo div.KDA span.kda').text(),
                champion_win_ratio: $el.find('td.ChampionInfo div.WinRatio span.ratio').text(),
                champion_games: $el.find('td.ChampionInfo div.WinRatio span.title').text().split(" ")[0],
              };
            }).get()
          };
          return teamInfo;
        }

        return {
          teamOne: processTable('table.teamOne'),
          teamTwo: processTable('table.teamTwo'),
        };
      })
      .catch(function (err) {
        console.log("error processing opgg's html", err.stack)
      });
  }),
  counters: Command(['championselect.champion'], function (opts, dataSourceGetters) {
    var results_promise = dataSourceGetters['championselect.champion'](opts)
    var lane = opts.lane || "all";
    results_promise = results_promise.then(function (html) {
      // extract the data from the html
      var $ = cheerio.load(html);
      // TODO: extend to work for specified lanes by replacing _general
      var $champs = $('._'+lane+' .weak-block .champ-block .left.theinfo');
      var counters = [];
      $champs.each(function (i, el) {
        $el = $(el);
        var counter = {
          name: $el.find('a.left').text(),
          lane: $el.find('.info .lane').text(),
          upvotes: $el.find('.info .uvote').text(),
          downvotes: $el.find('.info .dvote').text()
        };
        counters.push(counter);
      });
      return counters;
    });
    return results_promise;
  }),
  free: Command(['riot.champions'], function (opts, dataSourceGetters) {
    // build the data structure that should be send from the API to the caller
    // now have access to the data source values by calling getDataSourceGetters(options) which will return a promise for the data in that source
    // each build function is responsible for waiting for the data sources to load.
    var champions_promise = dataSourceGetters['riot.champions']({
      region: opts.region,
      free: true
    });
    var results_promise = champions_promise.then(function (champs) {
      // Do any formatting here
      return champs;
    });
    return results_promise;
  }),
  champions_names: Command(['riot.static_champions_data'], function (opts, dataSourceGetters) {
    // build the data structure that should be send from the API to the caller
    // now have access to the data source values by calling getDataSourceGetters(options) which will return a promise for the data in that source
    // each build function is responsible for waiting for the data sources to load.
    opts = opts || {}
    var champions_promise = dataSourceGetters['riot.static_champions_data'](opts);
    var results_promise = champions_promise.then(function (lookups) {
      // Do any formatting here
      return Object.keys(lookups.lookupByName);
    });
    return results_promise;
  }),
  summoner_id: Command(['riot.summoner_id'], function (opts, dataSourceGetters) {
    // build the data structure that should be send from the API to the caller
    // now have access to the data source values by calling getDataSourceGetters(options) which will return a promise for the data in that source
    // each build function is responsible for waiting for the data sources to load.
    opts = opts || {}
    var summonerIdPromise = dataSourceGetters['riot.summoner_id'](opts);
    var results_promise = summonerIdPromise.then(function (summoner_id) {
      return summoner_id;
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
        var wins = null;
        var losses = null;


        // only calculate the stats for the champion in question
        // or in the case of no provided champion name, the 0 id
        // which is the aggregate stats
        championId = lookups.lookupByName[opts.champion_name] || 0;
        // find the champion matching the id from the stats
        var champ = _.find(statsPerChampion, function (el) {
          return el.id == championId
        });
        if (champ) {
          wins = champ.stats.totalSessionsWon
          losses = champ.stats.totalSessionsLost
        }

        return {
          wins: wins,
          losses: losses,
          winRate: wins && losses && ((wins/(wins+losses))*100).toFixed(2)
        };
      });
    return results_promise;
  }),
  best: Command(['riot.ranked_stats', 'riot.static_champions_data'], function (opts, dataSourceGetters) {
    console.log(opts)
    var stats_promise = dataSourceGetters['riot.ranked_stats'](opts);
    var champions_data_promise = dataSourceGetters['riot.static_champions_data'](opts);
    // wait for all data sources and call a handler to
    var results_promise = Q.all([stats_promise, champions_data_promise])
      .spread(function (rawStatsPerChampion, lookups){
        // console.log("command received", rawStatsPerChampion, lookups);
        // console.log(rawStatsPerChampion);
        // calculate stats for all champions
        // loop over all the champions and create an array of calculated stats
        var champStats = []
        _.each(rawStatsPerChampion, function (champion) {
          var championId = champion.id;
          if(championId == 0) {
            return;
          }
          // TODO: take into consideration champion_name if set
          var wins = 0;
          var losses = 0;
          // loop over the provided stats
          _.each(champion.stats, function (val, key, obj) {
            if (key === "totalSessionsWon") {
              wins += val;
            }
            if (key === "totalSessionsLost") {
              losses += val;
            }
          });
          champStats.push({
            id: championId,
            name: lookups.lookupById[championId],
            wins: wins,
            losses: losses,
            winRate: ((wins/(wins+losses))*100).toFixed(2)
          });
        });
        // sort descending
        var top = _.sortBy(champStats, function (champ) {
          return -1 * parseFloat(champ.winRate);
        })
        return top;
      });
    return results_promise;
  }),
}


module.exports = Commands
