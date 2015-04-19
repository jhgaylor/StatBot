var CommandsRouter = require('express').Router();

var _ = require('underscore')
var Q = require('q');
var async = require('async')
var request = require('request')

var Commands = require('../Commands');

var IreliaLib = require('irelia')
var Irelia = new IreliaLib({
  secure: true,
  host: 'na.api.pvp.net',
  path: '/api/lol/',
  key: process.env.LOL_API_KEY,
  debug: true
});

// TODO: make this come from a data source
var LOLCHAMPIONSDATA = {"Thresh":{"id":412,"key":"Thresh","name":"Thresh","title":"the Chain Warden"},"Aatrox":{"id":266,"key":"Aatrox","name":"Aatrox","title":"the Darkin Blade"},"Tryndamere":{"id":23,"key":"Tryndamere","name":"Tryndamere","title":"the Barbarian King"},"Gragas":{"id":79,"key":"Gragas","name":"Gragas","title":"the Rabble Rouser"},"Cassiopeia":{"id":69,"key":"Cassiopeia","name":"Cassiopeia","title":"the Serpent's Embrace"},"Poppy":{"id":78,"key":"Poppy","name":"Poppy","title":"the Iron Ambassador"},"Ryze":{"id":13,"key":"Ryze","name":"Ryze","title":"the Rogue Mage"},"Sion":{"id":14,"key":"Sion","name":"Sion","title":"The Undead Juggernaut"},"Annie":{"id":1,"key":"Annie","name":"Annie","title":"the Dark Child"},"Karma":{"id":43,"key":"Karma","name":"Karma","title":"the Enlightened One"},"Nautilus":{"id":111,"key":"Nautilus","name":"Nautilus","title":"the Titan of the Depths"},"Lux":{"id":99,"key":"Lux","name":"Lux","title":"the Lady of Luminosity"},"Ahri":{"id":103,"key":"Ahri","name":"Ahri","title":"the Nine-Tailed Fox"},"Olaf":{"id":2,"key":"Olaf","name":"Olaf","title":"the Berserker"},"Viktor":{"id":112,"key":"Viktor","name":"Viktor","title":"the Machine Herald"},"Anivia":{"id":34,"key":"Anivia","name":"Anivia","title":"the Cryophoenix"},"Garen":{"id":86,"key":"Garen","name":"Garen","title":"The Might of Demacia"},"Singed":{"id":27,"key":"Singed","name":"Singed","title":"the Mad Chemist"},"Lissandra":{"id":127,"key":"Lissandra","name":"Lissandra","title":"the Ice Witch"},"Maokai":{"id":57,"key":"Maokai","name":"Maokai","title":"the Twisted Treant"},"Morgana":{"id":25,"key":"Morgana","name":"Morgana","title":"Fallen Angel"},"Evelynn":{"id":28,"key":"Evelynn","name":"Evelynn","title":"the Widowmaker"},"Fizz":{"id":105,"key":"Fizz","name":"Fizz","title":"the Tidal Trickster"},"Zed":{"id":238,"key":"Zed","name":"Zed","title":"the Master of Shadows"},"Heimerdinger":{"id":74,"key":"Heimerdinger","name":"Heimerdinger","title":"the Revered Inventor"},"Rumble":{"id":68,"key":"Rumble","name":"Rumble","title":"the Mechanized Menace"},"Mordekaiser":{"id":82,"key":"Mordekaiser","name":"Mordekaiser","title":"the Master of Metal"},"Sona":{"id":37,"key":"Sona","name":"Sona","title":"Maven of the Strings"},"Katarina":{"id":55,"key":"Katarina","name":"Katarina","title":"the Sinister Blade"},"KogMaw":{"id":96,"key":"KogMaw","name":"Kog'Maw","title":"the Mouth of the Abyss"},"Ashe":{"id":22,"key":"Ashe","name":"Ashe","title":"the Frost Archer"},"Lulu":{"id":117,"key":"Lulu","name":"Lulu","title":"the Fae Sorceress"},"Karthus":{"id":30,"key":"Karthus","name":"Karthus","title":"the Deathsinger"},"Alistar":{"id":12,"key":"Alistar","name":"Alistar","title":"the Minotaur"},"Darius":{"id":122,"key":"Darius","name":"Darius","title":"the Hand of Noxus"},"Vayne":{"id":67,"key":"Vayne","name":"Vayne","title":"the Night Hunter"},"Varus":{"id":110,"key":"Varus","name":"Varus","title":"the Arrow of Retribution"},"Udyr":{"id":77,"key":"Udyr","name":"Udyr","title":"the Spirit Walker"},"Jayce":{"id":126,"key":"Jayce","name":"Jayce","title":"the Defender of Tomorrow"},"Leona":{"id":89,"key":"Leona","name":"Leona","title":"the Radiant Dawn"},"Syndra":{"id":134,"key":"Syndra","name":"Syndra","title":"the Dark Sovereign"},"Pantheon":{"id":80,"key":"Pantheon","name":"Pantheon","title":"the Artisan of War"},"Khazix":{"id":121,"key":"Khazix","name":"Kha'Zix","title":"the Voidreaver"},"Riven":{"id":92,"key":"Riven","name":"Riven","title":"the Exile"},"Corki":{"id":42,"key":"Corki","name":"Corki","title":"the Daring Bombardier"},"Azir":{"id":268,"key":"Azir","name":"Azir","title":"the Emperor of the Sands"},"Caitlyn":{"id":51,"key":"Caitlyn","name":"Caitlyn","title":"the Sheriff of Piltover"},"Nidalee":{"id":76,"key":"Nidalee","name":"Nidalee","title":"the Bestial Huntress"},"Galio":{"id":3,"key":"Galio","name":"Galio","title":"the Sentinel's Sorrow"},"Kennen":{"id":85,"key":"Kennen","name":"Kennen","title":"the Heart of the Tempest"},"Veigar":{"id":45,"key":"Veigar","name":"Veigar","title":"the Tiny Master of Evil"},"Bard":{"id":432,"key":"Bard","name":"Bard","title":"the Wandering Caretaker"},"Gnar":{"id":150,"key":"Gnar","name":"Gnar","title":"the Missing Link"},"Graves":{"id":104,"key":"Graves","name":"Graves","title":"the Outlaw"},"Malzahar":{"id":90,"key":"Malzahar","name":"Malzahar","title":"the Prophet of the Void"},"Vi":{"id":254,"key":"Vi","name":"Vi","title":"the Piltover Enforcer"},"Kayle":{"id":10,"key":"Kayle","name":"Kayle","title":"The Judicator"},"Irelia":{"id":39,"key":"Irelia","name":"Irelia","title":"the Will of the Blades"},"LeeSin":{"id":64,"key":"LeeSin","name":"Lee Sin","title":"the Blind Monk"},"Elise":{"id":60,"key":"Elise","name":"Elise","title":"The Spider Queen"},"Volibear":{"id":106,"key":"Volibear","name":"Volibear","title":"the Thunder's Roar"},"Nunu":{"id":20,"key":"Nunu","name":"Nunu","title":"the Yeti Rider"},"TwistedFate":{"id":4,"key":"TwistedFate","name":"Twisted Fate","title":"the Card Master"},"Jax":{"id":24,"key":"Jax","name":"Jax","title":"Grandmaster at Arms"},"Shyvana":{"id":102,"key":"Shyvana","name":"Shyvana","title":"the Half-Dragon"},"Kalista":{"id":429,"key":"Kalista","name":"Kalista","title":"the Spear of Vengeance"},"DrMundo":{"id":36,"key":"DrMundo","name":"Dr. Mundo","title":"the Madman of Zaun"},"Brand":{"id":63,"key":"Brand","name":"Brand","title":"the Burning Vengeance"},"Diana":{"id":131,"key":"Diana","name":"Diana","title":"Scorn of the Moon"},"Sejuani":{"id":113,"key":"Sejuani","name":"Sejuani","title":"the Winter's Wrath"},"Vladimir":{"id":8,"key":"Vladimir","name":"Vladimir","title":"the Crimson Reaper"},"Zac":{"id":154,"key":"Zac","name":"Zac","title":"the Secret Weapon"},"RekSai":{"id":421,"key":"RekSai","name":"Rek'Sai","title":"the Void Burrower"},"Quinn":{"id":133,"key":"Quinn","name":"Quinn","title":"Demacia's Wings"},"Akali":{"id":84,"key":"Akali","name":"Akali","title":"the Fist of Shadow"},"Tristana":{"id":18,"key":"Tristana","name":"Tristana","title":"the Yordle Gunner"},"Hecarim":{"id":120,"key":"Hecarim","name":"Hecarim","title":"the Shadow of War"},"Sivir":{"id":15,"key":"Sivir","name":"Sivir","title":"the Battle Mistress"},"Lucian":{"id":236,"key":"Lucian","name":"Lucian","title":"the Purifier"},"Rengar":{"id":107,"key":"Rengar","name":"Rengar","title":"the Pridestalker"},"Warwick":{"id":19,"key":"Warwick","name":"Warwick","title":"the Blood Hunter"},"Skarner":{"id":72,"key":"Skarner","name":"Skarner","title":"the Crystal Vanguard"},"Malphite":{"id":54,"key":"Malphite","name":"Malphite","title":"Shard of the Monolith"},"Yasuo":{"id":157,"key":"Yasuo","name":"Yasuo","title":"the Unforgiven"},"Xerath":{"id":101,"key":"Xerath","name":"Xerath","title":"the Magus Ascendant"},"Teemo":{"id":17,"key":"Teemo","name":"Teemo","title":"the Swift Scout"},"Nasus":{"id":75,"key":"Nasus","name":"Nasus","title":"the Curator of the Sands"},"Renekton":{"id":58,"key":"Renekton","name":"Renekton","title":"the Butcher of the Sands"},"Draven":{"id":119,"key":"Draven","name":"Draven","title":"the Glorious Executioner"},"Shaco":{"id":35,"key":"Shaco","name":"Shaco","title":"the Demon Jester"},"Swain":{"id":50,"key":"Swain","name":"Swain","title":"the Master Tactician"},"Ziggs":{"id":115,"key":"Ziggs","name":"Ziggs","title":"the Hexplosives Expert"},"Janna":{"id":40,"key":"Janna","name":"Janna","title":"the Storm's Fury"},"Talon":{"id":91,"key":"Talon","name":"Talon","title":"the Blade's Shadow"},"Orianna":{"id":61,"key":"Orianna","name":"Orianna","title":"the Lady of Clockwork"},"FiddleSticks":{"id":9,"key":"FiddleSticks","name":"Fiddlesticks","title":"the Harbinger of Doom"},"Fiora":{"id":114,"key":"Fiora","name":"Fiora","title":"the Grand Duelist"},"Chogath":{"id":31,"key":"Chogath","name":"Cho'Gath","title":"the Terror of the Void"},"Rammus":{"id":33,"key":"Rammus","name":"Rammus","title":"the Armordillo"},"Leblanc":{"id":7,"key":"Leblanc","name":"LeBlanc","title":"the Deceiver"},"Zilean":{"id":26,"key":"Zilean","name":"Zilean","title":"the Chronokeeper"},"Soraka":{"id":16,"key":"Soraka","name":"Soraka","title":"the Starchild"},"Nocturne":{"id":56,"key":"Nocturne","name":"Nocturne","title":"the Eternal Nightmare"},"Jinx":{"id":222,"key":"Jinx","name":"Jinx","title":"the Loose Cannon"},"Yorick":{"id":83,"key":"Yorick","name":"Yorick","title":"the Gravedigger"},"Urgot":{"id":6,"key":"Urgot","name":"Urgot","title":"the Headsman's Pride"},"MissFortune":{"id":21,"key":"MissFortune","name":"Miss Fortune","title":"the Bounty Hunter"},"MonkeyKing":{"id":62,"key":"MonkeyKing","name":"Wukong","title":"the Monkey King"},"Blitzcrank":{"id":53,"key":"Blitzcrank","name":"Blitzcrank","title":"the Great Steam Golem"},"Shen":{"id":98,"key":"Shen","name":"Shen","title":"Eye of Twilight"},"Braum":{"id":201,"key":"Braum","name":"Braum","title":"the Heart of the Freljord"},"XinZhao":{"id":5,"key":"XinZhao","name":"Xin Zhao","title":"the Seneschal of Demacia"},"Twitch":{"id":29,"key":"Twitch","name":"Twitch","title":"the Plague Rat"},"MasterYi":{"id":11,"key":"MasterYi","name":"Master Yi","title":"the Wuju Bladesman"},"Taric":{"id":44,"key":"Taric","name":"Taric","title":"the Gem Knight"},"Amumu":{"id":32,"key":"Amumu","name":"Amumu","title":"the Sad Mummy"},"Gangplank":{"id":41,"key":"Gangplank","name":"Gangplank","title":"the Saltwater Scourge"},"Trundle":{"id":48,"key":"Trundle","name":"Trundle","title":"the Troll King"},"Kassadin":{"id":38,"key":"Kassadin","name":"Kassadin","title":"the Void Walker"},"Velkoz":{"id":161,"key":"Velkoz","name":"Vel'Koz","title":"the Eye of the Void"},"Zyra":{"id":143,"key":"Zyra","name":"Zyra","title":"Rise of the Thorns"},"Nami":{"id":267,"key":"Nami","name":"Nami","title":"the Tidecaller"},"JarvanIV":{"id":59,"key":"JarvanIV","name":"Jarvan IV","title":"the Exemplar of Demacia"},"Ezreal":{"id":81,"key":"Ezreal","name":"Ezreal","title":"the Prodigal Explorer"}};
var LOL_ID_TO_NAME = {};
_.each(LOLCHAMPIONSDATA, function (e, i ,l) {
  LOL_ID_TO_NAME[e.id] = i;
});

CommandsRouter.route('/free')
  .get( function (req, res) {
    region = req.params.region;
    Commands.free.run({region: region})
      .then( function (results) {
        res.send({
          command: "/commands/free",
          data: results
        });
      })
      .catch( function (err) {
        res.send({ error: res });
      });
  });

CommandsRouter.route('/stats')
  .get( function (req, res) {
    var summoner_name = req.query.summoner;
    var champion_name = req.query.champion_name;
    var region = req.query.region;
    var season = req.query.season;
    if (! summoner_name) {
      res.send({
        command: "/commands/stats",
        error: "Please send `summoner` parameter."
      });
      return;
    }
    Commands.win_loss.run({
        summoner_name: summoner_name,
        champion_name:champion_name,
        season: season,
        region: region
      })
      .then( function (results) {
        console.log("command returned", results)
        res.send({
          command: "/commands/win_loss",
          data: results
        });
      })
      .catch( function (err) {
        console.log("command err", err)
        res.send({ error: res });
      });
  });

module.exports = CommandsRouter;
