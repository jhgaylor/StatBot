var Q = require('q');

// getterFns promises should resolve to a POJO so it can be json serialized.
//   the job of the getterFns is to make IO calls and process the results
//   into a data structure that gets cached and used by the commands' buildFns
//   to process into responses
function DataSource (name, timeout, cache, getterFn, keyFn) {
  // Returns the key for this data source, which is built from it's name
  // `opts` allow for a single named data source's results to be
  // cached once per set of arguments it is called with.
  // The default keyFn is a basic JSON serializer
  keyFn = keyFn || function (name, opts) {
    // the name param is passed because w/o it a passed in function
    // wouldn't have access to it.
    optsStr = JSON.stringify(opts);
    return [name, optsStr].join("-");
  };

  var dataDeferred;
  return {
    // always returns a promise
    // the promise will resolve w/ data or reject with an http or redis err
    // if it is called again before the promise resolves, it returns
    //   the pending promise rather than overwriting it. This will allow
    //   for data sources to depend on other data source w/o worrying
    //   about load order.
    //   NOTE: this dependency can't be circular.
    get: function (opts) {
      var key = keyFn(name, opts);
      // don't overwrite the promise while it's being fulfilled
      if ((dataDeferred === undefined) || (!dataDeferred.promise.isPending())) {
        dataDeferred = Q.defer()
        cache.get(key).then(function (data) {
          if (data) {
            console.log("cache hit", key);
            dataDeferred.resolve(JSON.parse(data))
            return;
          }

          console.log("cache miss", key);
          var getterDeferred = Q.defer();
          // will resolve or reject getterDeferred.promise from the getterFn
          getterFn(opts, getterDeferred.makeNodeResolver());
          // cache the value once we get it
          getterDeferred.promise.then(function (data) {
            // store the data as a json string
            cache.set(key, JSON.stringify(data), this.timeout);
            dataDeferred.resolve(data);
          });
        });
      }
      return dataDeferred.promise
    }
  }
}

module.exports = DataSource
