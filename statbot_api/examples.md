## Consume a data source's results

```js
var DataSources = require('./DataSources');
console.log(DataSources);
DataSources.riot.free_champions.get({region:"na"}).then(function (champs) {
  console.log("got", champs);
}).catch(function (err) {
  console.log("err", err);
})
```

## Consume a command's results

```js
var Commands = require('./Commands');
Commands.free.run({region: "na"}).then(function (champions) {
  console.log("command got ", champions);
});
```
