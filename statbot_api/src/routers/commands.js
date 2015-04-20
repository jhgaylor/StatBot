var CommandsRouter = require('express').Router();

var _ = require('underscore')
var Q = require('q');
var async = require('async')
var request = require('request')

var Commands = require('../Commands');

CommandsRouter.route('/free')
  .get( function (req, res) {
    region = req.params.region;
    Commands.free.run({region: region})
      .then( function (results) {
        res.send({
          command: "/commands/free",
          data: results
        });
      })
      .catch( function (err) {
        res.send({ error: res });
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
    Commands.win_loss.run({
        summoner_name: summoner_name,
        champion_name: champion_name,
        season: season,
        region: region
      })
      .then( function (results) {
        console.log("command returned", results)
        res.send({
          command: "/commands/win_loss",
          data: results
        });
      })
      .catch( function (err) {
        console.log("command err", err)
        res.send({ error: res });
      });
  });

module.exports = CommandsRouter;
