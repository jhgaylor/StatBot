// Bootstraps the application and serve the express app

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
  console.log("Listening: "+server.address().port);
});

// test the data sources
// var DataSources = require('./DataSources');
// console.log(DataSources);
// DataSources.riot.free_champions.get({region:"na"}).then(function (champs) {
//   console.log("got", champs);
// }).catch(function (err) {
//   console.log("err", err);
// })

// test the commands
// var Commands = require('./Commands');
// Commands.free.run({region: "na"}).then(function (champions) {
//   console.log("command got ", champions);
// });
