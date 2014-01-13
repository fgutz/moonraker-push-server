var app = require('http').createServer(handler),
    io = require('socket.io').listen(app),
    fs = require('fs'),
    Skyfall = require('./skyfall.js');


// creating the server ( localhost:8000 ) 
app.listen(8000);

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
touchSkyfall(servers);

// creating a new websocket to keep the content updated without any AJAX request
io.sockets.on('connection', function(socket) {
  var obj = {test:'case'};
  json = JSON.stringify(obj);
  socket.volatile.emit('notification', json);
});
