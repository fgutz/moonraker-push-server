var app        = require('http').createServer(handler),
    fs         = require('fs'),
    io         = require('socket.io').listen(app),
    pushServer = require('./moonraker-push'),
    nodeproxy  = require('nodeproxy'),
    port       = 8000,
    threshold  = 10;

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

io.sockets.on('connection', function(outSocket){

  function loadInfo(server) {
    server.socket.on('loadInfo', function(data){
      
      if (data.loadavg[0].toFixed(2) > threshold) {
        var info = {
          "name": server.name,
          "ip"  : server.ip,
          "1min": data.loadavg[0].toFixed(2)
        };
        info = JSON.stringify(info);
        outSocket.emit('notification', info);
      }

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

  // read servers.json file and store in var
  var serverile = __dirname + '/servers.json';
  fs.readFile(serverile, 'utf8', function (err, data) {
    if (err) {
      console.log('Error: ' + err);
      return;
    }
   
    var servers = JSON.parse(data);
    begin(servers);
  });

});


