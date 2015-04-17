var BaseRouter = require('express').Router();

BaseRouter.route('/')
  .get(function (err, res) {
  	res.status(200).json({status: "success"});
  });
BaseRouter.route('/help');

module.exports = BaseRouter;