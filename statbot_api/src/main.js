// Bootstraps the application and serve the express app
var logentries = require('le_node');
var log = logentries.logger({
  token: process.env.LOGENTRIES_API_KEY,
});
log.level("debug");
// import the routers
var BaseRouter = require('./routers/base');
var CommandsRouter = require('./routers/commands');
// console.log(BaseRouter, CommandsRouter);
// instantiate express
var app = require('express')();

// grab a logging library
var logger = require('morgan');

// for json body parsing
var bodyParser = require('body-parser');

// bind the logger to the express app
app.use(logger("dev", {}));

// bind the routers at the appropriate url
app.use('/', BaseRouter);
app.use('/commands', CommandsRouter);

// give the environment a chance to set the port explicitly or default to 3000
var PORT = 3000;

// start up the server
var server = app.listen( PORT, function () {
  log.info("Listening: "+server.address().port);
  console.log("Listening: "+server.address().port)
});

// d = require('./DataSources');
// d.opgg.overview.get({summoner_name:"runningunnin"})
//   .then(function(res) {
//     console.log("res", res);
//   })
//   .catch(function (err) {
//     console.log("error getting data", err);
//   });
// c = require('./Commands');
// c.intel.run({summoner_name:"runningunnin"})
//   .then(function(res) {
//     console.log("res", res);
//     console.log(JSON.stringify(res));
//   })
//   .catch(function (err) {
//     console.log("err with command", err)
//   })
