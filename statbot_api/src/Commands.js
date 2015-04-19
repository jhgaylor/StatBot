var Command = require('./Command');
var Q = require('q');
// NOTE: For each data_source listed, there will be a key accessible in
//   the builderFn.  Only list a data_source if builder depends directly on the data
//   Do NOT list subdeps
Commands = {
  free: Command(['riot.free_champions'], function (opts, dataSourceGetters) {
    // build the data structure that should be send from the API to the caller
    // now have access to the data source values by calling getDataSourceGetters(options) which will return a promise for the data in that source
    // each build function is responsible for waiting for the data sources to load.
    var champions_promise = dataSourceGetters['riot.free_champions']({
      region: opts.region
    });
    var results_promise = champions_promise.then(function (champs) {
      // Do any formatting here
      return champs;
    });
    return results_promise;
  }),
}


module.exports = Commands
