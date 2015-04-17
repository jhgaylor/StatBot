// Bootstraps the application and serve the express app

// import the routers
import CommandsRouter from './src/routers/commands'
import BaseRouter from './src/routers/base'

// instantiate express
let app = require('express')();

// grab a logging library
let logger = require('morgan');

// for json body parsing
let bodyParser = require('body-parser');

// bind the logger to the express app
app.use(logger("dev", {}));

// bind the routers at the appropriate url
app.use('/', BaseRouter);
app.use('/commands', CommandsRouter);

// give the environment a chance to set the port explicitly or default to 3000
const PORT = process.env.port || 3000;

// start up the server
let server = app.listen( PORT, () => {
  console.log "Listening: ${server.address().port}";
});