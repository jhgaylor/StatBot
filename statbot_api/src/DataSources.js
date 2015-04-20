var request = require('request');
var _ = require('underscore');
var DataSource = require('./DataSource');

var Cache = require('./Cache')();

var Browser = require('zombie');
// NOTE: remember to clean up the cache connection
// TODO: come up with anything more elegant than this...
// setTimeout(function () {
//   console.log("cache quit because it was told to in src/DataSource");
//   Cache.quit();
// }, 5000);

// Configure 3rd party Riot Games API library
var LolApi = require('leagueapi');
LolApi.init(process.env.LOL_API_KEY, 'na');

// this gives us a way to modify the cacheing scale
// `ONE_SECOND = 1 * 2` for instance would make everything
// cache for twice as long.
var ONE_SECOND = 1;
var ONE_MINUTE = ONE_SECOND * 60;
var ONE_HOUR = ONE_MINUTE * 60;
var ONE_DAY = ONE_HOUR * 24;
var ONE_WEEK = ONE_DAY * 7;

// TODO: be able to register data sources from anywhere in the app (preferably all from src/datasources/)
// define the data sources
var DataSources = {
  // the official riot games api @ https://developer.riotgames.com/
  riot: {
    static_champions_data: DataSource('riot_static_champions_data', ONE_WEEK, Cache,
      function (opts, done) {
        var region = opts.region;
        LolApi.Static.getChampionList({}, region)
          .then(function (champs) {
            // console.log("got champs data", champs.data);
            var CHAMPION_ID_TO_NAME = {};
            var CHAMPION_NAME_TO_ID = {};
            _.each(champs.data, function (e, i ,l) {
              CHAMPION_ID_TO_NAME[e.id] = i;
              CHAMPION_NAME_TO_ID[i.toLowerCase()] = e.id
              });
            var data = {
              lookupById: CHAMPION_ID_TO_NAME,
              lookupByName: CHAMPION_NAME_TO_ID,
            };
            done(null, data)
          })
          .catch(function (err) {
            done(err);
          });
      }
    ),
    free_champions: DataSource('riot_free_champions', ONE_DAY, Cache,
      function (opts, done) {
        // grabs the free champion list from an unofficial api
        // use opts to make an http request and return some data
        // do async work and call the done cb
        var region = opts.region || "na"
        var freeToPlay = true;
        staticChampionsDataPromise = DataSources.riot.static_champions_data.get({
          region: region
        })
          .then(function (lookups) {
            LolApi.getChampions(freeToPlay, region)
              .then(function (champs) {
                var champion_names = _.pluck(champs, 'id').map(function (id) {
                  return lookups.lookupById[id];
                });
                // console.log(champion_names);
                done(null, champion_names);
              })
              .catch(function (err) {
                done(err);
              });
          })
          .catch(function (err) {
            console.log("error getting static champions data", err);
          })
      }
    ),
    summoner_id: DataSource('riot_summoner_id', ONE_WEEK, Cache,
      function (opts, done) {
        var summoner_name = opts.summoner_name
        var region = opts.region || "na"
        LolApi.Summoner.getByName(summoner_name, region)
          .then(function (data) {
            var id = data && data[summoner_name].id;
            done(null, id);
          })
          .catch(function (err) {
            console.log("err getting summoner id", err)
            done(err);
          });
      }
    ),
    summoner_name: DataSource('riot_summoner_name', ONE_WEEK, Cache,
      function (opts, done) {
        var summoner_id = opts.summoner_id
        var region = opts.region || "na"
        LolApi.Summoner.getByID(summoner_id, region)
          .then(function (data) {
            console.log(data);
            var name = data && data[summoner_id].name;
            done(null, name);
          })
          .catch(function (err) {
            console.log("err getting summoner id", err)
            done(err);
          });
      }
    ),
    ranked_stats: DataSource('riot_ranked_stats', ONE_HOUR, Cache,
      function (opts, done) {
        var summoner_name = opts.summoner_name;
        var region = opts.region || "na";
        var season = opts.season || "2015"

        // this source depends on another source, 'riot_summoner_id'
        var summoner_id_promise = DataSources.riot.summoner_id.get({
          summoner_name: summoner_name,
          region: region
        }).then(function (summonerId) {
          // now actually go grab the ranked stats
          // console.log("ID: ", id)
          LolApi.Stats.getRanked(summonerId, season, region)
            .then(function (ranked_stats) {
              // console.log("--", ranked_stats)
              done(null, ranked_stats);
            })
            .catch(function (err) {
              done(err);
            });
        });
      }
    ),
  },
  championselect: {
    champion: DataSource('championselect_champpage', ONE_WEEK, Cache,
      function (opts, done) {
        var champion_name = opts.champion_name;
        if(! champion_name || champion_name.length === 0){
          done(new Error("No champion name provided."))
        }
        var b = new Browser({site: 'http://www.championselect.net', waitDuration:'10s', runScripts: false})
        b.visit('/champ/'+champion_name)
          .then(function () {
            console.log("champ select loaded");

            var html = b.html();
            done(null, html);
          });
      }
    ),
  }
};
module.exports = DataSources
