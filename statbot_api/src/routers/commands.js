var CommandsRouter = require('express').Router();

var _ = require('underscore')

var async = require('async')
var request = require('request')

var LoL = require('lol-api')
LoL.configure(process.env.LOL_API_KEY)
// LoL = new lol_api "d5a5cb69-7b70-4a63-bcc1-91baa5e093b7"
var getSummonerIDFromName = function (summoner_name, cb) {
  LoL.summonerByName(summoner_name, 'na', function (results) {
    var summoner_id = results[summoner_name].id
    cb(null, summoner_id)
  });
}

var getRankedStatsFromID = function (summoner_id, cb) {
  LoL.statsRanked(summoner_id, 'na', function (data) {
    cb(null, data)
  });
}


CommandsRouter.route('/free')
  .get( function (req, res) {
    // TEEMOJSON_FREE_CHAMPIONS.get().then (data) ->
    //   res.send
    //     command: '/commands/free'
    //     data: data
    // , (err) ->
    //   res.send
    //     error: err
    // res.send {command:"/commands/free"}
    getFreeChampions = function () {
      // do async work and call cb(null, object)
      var region = "na";
      var url = "https://teemojson.p.mashape.com/service-state/${region}/free-week";
      request_options = {
        url: url,
        headers: {
          "X-Mashape-Authorization": process.env.TEEMOJSON_API_KEY
        }
      };

      request(request_options, function (err, resp, body) {
        if (err) {
          console.log("Encountered an error :( ${err}");
          res.send({error: err});
        }
        else
          // TODO: Cache http calls
          // cache[url] = body

          // process the data
          var data = JSON.parse(body);
          var champs = _.without(_.values(data.data.free), null);
          res.send({
            command: "/commands/free",
            data: champs
          });
      });
    };
    getFreeChampions();
  });

// CommandsRouter.route('/stats')
//   .get( (req, res) => {
//     let summoner_name = req.param('summoner');
//     let champion_name = req.param('champion');

//     console.log(req.query, "name ${summoner_name}")
//     if (! summoner_name) {
//       res.send({
//         command: "/commands/stats",
//         error: "Please send `summoner` parameter."
//       });
//       return;
//     }

//     let doWork = async.compose(getRankedStatsFromID, getSummonerIDFromName);
//     doWork(summoner_name, (err, results) => {
//       if (err) {
//         console.log(err);
//         res.send({
//           command: "/commands/stats",
//           error: err
//         });
//       }
//       else {
//         let champions = [];
//         let wins = 0;
//         let losses = 0;
//         champions = results.champions;
//         console.log(champions);
//         _.each(champions, (champion) => {
//           _.each(champion.stats, (val, key, obj) => {
//             if (key === "totalSessionsWon") {
//               wins += val;
//             }

//             if (key === "totalSessionsLost") {
//               losses += val;
//             }
//           });
//         });

//         res.send({
//           command: "/commands/stats",
//           data: {
//             wins: wins,
//             losses: losses
//           }
//         });
//       }
//     });
//   });

module.exports = CommandsRouter;