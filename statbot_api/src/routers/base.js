var BaseRouter = require('express').Router();
var DataSources = require('../DataSources');
var _ = require('underscore')
var Q = require('q');
var log = logentries.logger({
  token: process.env.LOGENTRIES_API_KEY,
});
log.level("debug");

BaseRouter.route('/')
  .get(function (err, res) {
  	res.status(200).json({status: "success"});
  });
BaseRouter.route('/getSummonerNameById')
  .get(function (req, res) {
    var summoner_id = req.query.summoner_id;
    console.log("looking up", summoner_id)
    DataSources.riot.summoner_name.get({summoner_id: summoner_id})
      .then(function (name) {
        console.log("sending", name)
        res.send({
          data: {
            summoner_id: summoner_id,
            summoner_name: name
          }
        });
      })
      .catch(function (err) {
        res.send({ error: res });
      })
  });

module.exports = BaseRouter;
