var CommandsRouter = require('express').Router();
var Commands = require('../Commands');
var _ = require('underscore')
var Q = require('q');
var logentries = require('le_node');
var log = logentries.logger({
  token: process.env.LOGENTRIES_API_KEY,
});
log.level("debug");

CommandsRouter.route('/summoner_id')
  .get( function (req, res) {
    var summoner_name = req.query.summoner_name;
    Commands.summoner_id.run({summoner_name: summoner_name})
      .then( function (results) {
        res.send({
          command: "/commands/summoner_id",
          data: results
        });
      })
      .catch( function (err) {
        log.err(err);
        res.send({ error: res });
      });
  });

CommandsRouter.route('/free')
  .get( function (req, res) {
    var region = req.query.region;
    Commands.free.run({region: region})
      .then( function (results) {
        log.debug("/commands/free", results)
        res.send({
          command: "/commands/free",
          data: results
        });
      })
      .catch( function (err) {
        res.send({ error: res });
      });
  });

CommandsRouter.route('/intel')
  .get( function (req, res) {
    var region = req.query.region;
    var summoner_name = req.query.summoner_name;
    Commands.intel.run({region: region, summoner_name: summoner_name})
      .then( function (results) {
        res.send({
          command: "/commands/intel",
          data: results
        });
      })
      .catch( function (err) {
        res.send({ error: res });
      });
  });

CommandsRouter.route('/champions_names')
  .get( function (req, res) {
    var region = req.query.region;
    Commands.champions_names.run({})
      .then( function (results) {
        res.send({
          command: "/commands/champions_names",
          data: results
        });
      })
      .catch( function (err) {
        res.send({ error: res });
      });
  });

CommandsRouter.route('/counters')
  .get( function (req, res) {
    var champion_name = req.query.champion_name;
    var lane = req.query.lane;
    var commandPromise = Commands.counters.run({champion_name: champion_name, lane: lane})
      .then( function (results) {
        res.send({
          command: "/commands/counter",
          data: results
        });
      })
    commandPromise.catch( function (err) {
      res.status(400).send({ error: err });
    });
  });

CommandsRouter.route('/stats')
  .get( function (req, res) {
    var summoner_name = req.query.summoner_name.toLowerCase();
    var champion_name = req.query.champion_name.toLowerCase();
    var region = req.query.region;
    var season = req.query.season;
    if (! summoner_name) {
      res.send({
        command: "/commands/stats",
        error: "Please send `summoner` parameter."
      });
      return;
    }
    Commands.stats.run({
        summoner_name: summoner_name,
        champion_name: champion_name,
        season: season,
        region: region
      })
      .then( function (results) {
        console.log("command returned", results)
        res.send({
          command: "/commands/stats",
          data: results
        });
      })
      .catch( function (err) {
        console.log("command err", err)
        res.send({ error: res });
      });
  });

CommandsRouter.route('/best')
  .get( function (req, res) {
    var summoner_name = req.query.summoner_name.toLowerCase();
    var champion_name = req.query.champion_name.toLowerCase();
    var region = req.query.region;
    var season = req.query.season;
    var worst = req.query.worst;
    if (! summoner_name) {
      res.send({
        command: "/commands/best",
        error: "Please send `summoner` parameter."
      });
      return;
    }
    Commands.best.run({
        summoner_name: summoner_name,
        champion_name: champion_name,
        season: season,
        region: region
      })
      .then( function (results) {
        console.log("command returned", results)
        if (worst) {
          results.reverse();
        }
        res.send({
          command: "/commands/win_loss",
          data: results
        });
      })
      .catch( function (err) {
        console.log("command err", err, err.stack)
        res.send({ error: res });
      });
  });

module.exports = CommandsRouter;

