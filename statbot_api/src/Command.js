var _ = require('underscore');
var DataSources = require('./DataSources');

var Command = function (data_sources, buildFn) {
  // returns a hashtable of data_source keys w/ a promise for its data
  // accounts for 'keys.like.this' for {keys:{like:{this: new DataSource()}}}
  // the data_source key will be undefined is the lookup failed
  function getDataSourceGetters () {
    var source_promise_getters = {};
    data_sources.forEach(function (source_key) {
      var keys = source_key.split('.');
      var location = DataSources;
      // dig through nested objects where source_key is of the form "a.b.c"
      keys.forEach(function (key) {
        if (location) {
          if (key in location) {
            location = location[key]
            return;
          }
        } else {
          // if any key isn't found in location, the DataSource doesn't exist
          console.log("could not find the next key", source_key, key, location)
          return;
        }
      })
      // set the value to the promise getter
      source_promise_getters[source_key] = location.get;
    });
    return source_promise_getters;
  }

  return {
    // opts needs to be kwargs so that it can be passed
    //   all over the place and every body know how to use the object
    run: function (opts) {
      var source_promise_getters = getDataSourceGetters()
      return buildFn(opts, source_promise_getters)
    }
  };
}


module.exports = Command
