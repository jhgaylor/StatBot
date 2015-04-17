var BaseRouter = require('express').Router();

BaseRouter.route('/');
BaseRouter.route('/help');

module.exports = BaseRouter;