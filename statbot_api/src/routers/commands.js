let CommandsRouter = require('express').Router();

let _ = require('underscore')

let async = require('async')
let request = require('request')

let LoL = require('lol-api')
LoL.configure process.env.LOL_API_KEY
// LoL = new lol_api "d5a5cb69-7b70-4a63-bcc1-91baa5e093b7"
getSummonerIDFromName (summoner_name, cb) => {
  LoL.summonerByName(summoner_name, 'na', (results) => {
    let summoner_id = results[summoner_name].id
    cb(null, summoner_id)
  });
}

getRankedStatsFromID (summoner_id, cb) => {
  LoL.statsRanked(summoner_id, 'na', (data) => {
    cb(null, data)
  });
}


CommandsRouter.route('/free')
  .get( (req, res) => {
    // TEEMOJSON_FREE_CHAMPIONS.get().then (data) ->
    //   res.send
    //     command: '/commands/free'
    //     data: data
    // , (err) ->
    //   res.send
    //     error: err
    // res.send {command:"/commands/free"}
    getFreeChampions = () => {
      // do async work and call cb(null, object)
      let region = "na";
      let url = "https://teemojson.p.mashape.com/service-state/${region}/free-week";
      request_options = {
        url: url
        headers:
          "X-Mashape-Authorization": "liyxg1azbxb73dzzegavcpfmz1d1a6"
      };

      request(request_options, (err, resp, body) => {
        if (err) {
          console.log("Encountered an error :( ${err}");
          res.send({error: err});
        }
        else
          // TODO: Cache http calls
          // cache[url] = body

          // process the data
          let data = JSON.parse(body);
          let champs = _.without(_.values(data.data.free), null);
          res.send({
            command: "/commands/free",
            data: champs
          });
      });
    };
    getFreeChampions();
  });

CommandsRouter.route('/stats')
  .get( (req, res) -> {
    let summoner_name = req.param('summoner');
    let champion_name = req.param('champion');

    console.log(req.query, "name ${summoner_name}")
    if (! summoner_name) {
      res.send({
        command: "/commands/stats",
        error: "Please send `summoner` parameter."
      });
      return;
    }

    let doWork = async.compose(getRankedStatsFromID, getSummonerIDFromName);
    doWork(summoner_name, (err, results) => {
      if (err) {
        console.log(err);
        res.send({
          command: "/commands/stats",
          error: err
        });
      }
      else {
        let champions = [];
        let wins = 0;
        let losses = 0;
        let champions = results.champions;
        console.log(champions);
        _.each(champions, (champion) => {
          _.each(champion.stats, (val, key, obj) => {
            if (key is "totalSessionsWon") {
              wins += val;
            }

            if (key is "totalSessionsLost") {
              losses += val;
            }
          });
        });

        res.send({
          command: "/commands/stats",
          data: {
            wins: wins,
            losses: losses
          }
        });
      }
    });
  });

export CommandsRouter;