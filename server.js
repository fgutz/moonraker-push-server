var fs = require('fs'),
    Skyfall = require('./skyfall.js');

function touchSkyfall(servers) {
  for(var name in servers){
    var server = servers[name];
    var port = 3007;
    if(typeof server == 'object'){
      var address = server['address'];
      if(server['port']) { port = server['port']; }
    } else {
      var split = server.split(':');
      var address = split[0];
      if(split.length > 1) { port = split[1]; }
    }
    Skyfall.addServer(name, address, port);
  }
}

var serverile = __dirname + '/servers.json';
fs.readFile(serverile, 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
 
  servers = JSON.parse(data);
  touchSkyfall(servers);
});
