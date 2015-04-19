var Q = require('q');
var request = require('request');
var _ = require('underscore');

var DataSources = require('./DataSources');
// use redis + expire
// args needs to be kwargs (opts) so that it can be passed
//   all over the place and every body know how to use the object
// need to cache the raw data from responses (json/html) or the data structure i want used or both?

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
    run: function (opts) {
      var source_promise_getters = getDataSourceGetters()
      return buildFn(opts, source_promise_getters)
    }
  };
}


module.exports = Command
