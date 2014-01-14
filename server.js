var app        = require('http').createServer(handler),
    fs         = require('fs'),
    io         = require('socket.io').listen(app),
    pushServer = require('./moonraker-push'),
    nodeproxy  = require('nodeproxy'),
    port       = 8000;

app.listen(port);

// on server started we can load our client.html page
function handler(req, res) {
  fs.readFile(__dirname + '/client.html', function(err, data) {
    if (err) {
      console.log(err);
      res.writeHead(500);
      return res.end('Error loading client.html');
    }
    res.writeHead(200);
    res.end(data);
  });
}

io.set('log level', 2);

function loadInfo(server) {
  server.socket.on('loadInfo', function(data){
    
    io.sockets.on('connection', function(socket){
      if (data.loadavg[0].toFixed(2) > 0.1) {
        var info = data.loadavg[0].toFixed(2);
        socket.emit('notification', info);
      }
    });
  
  });
}

// iterate through servers.json and begin socks for each server
function begin(servers) {
  var address;
  for(var name in servers){
    var server = servers[name];
    var port = 3007;
    if(typeof server == 'object'){
      address = server['address'];
      if(server['port']) { port = server['port']; }
    } else {
      var split = server.split(':');
      address = split[0];
      if(split.length > 1) { port = split[1]; }
    }
    var _server = pushServer.addServer(name, address, port);
    loadInfo(_server);
  }
}

// Get list of servers from local json file
var serverile = __dirname + '/servers.json';
fs.readFile(serverile, 'utf8', function (err, data) {
  if (err) {
    console.log('Error: ' + err);
    return;
  }
 
  servers = JSON.parse(data);
  begin(servers);
});


