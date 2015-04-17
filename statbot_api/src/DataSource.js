let Q = require('q');

// getterFns promises should resolve to a POJO so it can be json serialized.
//   the job of the getterFns is to make IO calls and process the results
//   into a data structure that gets cached and used by the commands' buildFns
//   to process into responses 
class DataSource
  constructor: (this.name, this.timeout, this.cache, this.getterFn, this.keyFn) => {
  }

  defaultKeyFn (name, args) => {
    let toQueryString = (obj) => {
      let parts = [];
      for(key of obj) {
        if (obj.hasOwnProperty(key)) {
          parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]));
        }
      }
          
      return parts.join("&");
    }
    return "${name}-${toQueryString(args)}"
  };

  // todo: account for arguments
  key (args) => {
    if this.keyFn
      return this.keyFn.call(this.name, args)
    else
      return DataSource.defaultKeyFn(this.name, args)
  }
    

  get (args) => {
    // always returns a promise
    // the promise will resolve w/ data, http err, or redis err
    // if it is called again before the promise resolves, it returns
    //   the pending promise rather than overwriting it. This will allow
    //   for data sources to depend on other data source w/o worrying 
    //   about load order.
    //   NOTE: this dependency can't be circular.
    let key = this.key(args)
    // don't overwrite the promise while it's being fulfilled
    if ((this.deferred is undefined) || (!this.deferred.promise.isPending())) {
      this.deferred = Q.defer();
      this.cache.get(key).then((data) => {
        if data{
          console.log("cache hit ${key}");
          this.deferred.resolve(JSON.parse(data))
        }
        else {
          console.log("cache miss ${key}");
          if (!this.getting) {
            getter_promise = this.getterFn(args);
            // cache the value once we get it
            getter_promise.then((data) => {
              this.cache.set(key, JSON.stringify(data), this.timeout);
              this.deferred.resolve(data);
            });
          }
        }
          
      });
    }
    return this.deferred.promise
  }

module.exports = DataSource