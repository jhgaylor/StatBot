var redis = require('redis');
var Q = require('q');
var url = require('url');
// A function that returns a cache object. Each cache object
// has an open connection to the cache server.
// All the methods of the cache objects return a promise
//   to facilitate chaining as well as to be consistent
var Cache = function () {
  // the redis handle is private.
  var CacheClient = (function () {
    // tcp://ip:port
    var redis_info = url.parse(process.env.REDIS_PORT || "");
    var REDIS_PORT = redis_info && redis_info.port || 6379;
    var REDIS_HOST = redis_info && redis_info.hostname || '127.0.0.1';
    // TODO: grab options from env vars (I don't need to pass any right now but others might.)
    var client = redis.createClient(REDIS_PORT, REDIS_HOST, {});
    client.on("error", function (err) {
      console.log("Redis client threw error: ", err)
      throw err;
    });
    return client;
  })();

  return {
    // a promise to return the value held at `key`
    get: function (key) {
      return Q.ninvoke(CacheClient, 'get', key);
    },
    // returns a promise for the result of setting
    // the value in the cache at `key`
    set: function (key, value, timeout) {
      // timeout has a default value of 0;
      timeout =  timeout || 0;
      var setterPromise = Q.ninvoke(CacheClient, 'set', key, value);
      // set the expiration after the key is set. this block will be
      // outside of the normal control flow but its effects aren't critical
      // to the success of the application. Fail quietly.
      if (timeout > 0) {
        setterPromise.then(function () {
          Q.ninvoke('expire', key, timeout).catch(function (err) {
            console.log("Failed to set a redis key expiration", key, timeout);
          });
        });
      }
      return setterPromise;
    },
    // returns null. This method wouldn't be in the middle of a chain anyway.
    quit: function () {
      CacheClient.quit();
      return null;
    }
  }
};

module.exports = Cache
