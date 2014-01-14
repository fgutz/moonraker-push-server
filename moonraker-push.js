var nodeproxy = require('nodeproxy'),
    ioClient = require('socket.io-client');

module.exports = {
  _servers: {},

  getServers: function(serverName){
    var _name = serverName || null;
    if (_name !== null && this._servers[_name]){
      return this._servers[_name];
    } else {
      return this._servers;
    }
  },

  addServer: function(serverName, ip, port){
    if(!port) { port = 3007; }
    
    var socket = ioClient.connect('http://' + ip + ':' + port, {
      'reconnect': true,
      'reconnection delay': 500,
      'max reconnection attempts': 5
    });

    var server = this._servers[serverName] = {
      name: serverName,
      ip: ip,
      port: port,
      socket: socket,
      cpuTimes: {},
      settings: {}
    };

    this.addListeners(server);
    this.startServer(server);
    return server;
  },

  startServer: function(server, opts){
    if(!opts) { opts = {}; }
    server.socket.emit('start', opts);
  },
  
  addListeners: function(server){
    var that = this;
    var socket = server.socket;
    
    // connecting
    socket.on('connecting', nodeproxy(function(){
      console.log('connecting...');
    }, server));
    // connect
    socket.on('connect', nodeproxy(function(){
      console.log('connected');
    }, server));
    // connect_failed
    socket.on('connect_failed', nodeproxy(function(){
      console.log('Failed to connect to ' + this.name);
    }, server));
    // disconnect
    socket.on('disconnect', nodeproxy(function(){
      console.log('disconnected from ' + this.name);
    }, server));
    // reconnecting
    socket.on('reconnecting', nodeproxy(function(){
      console.log('reconnecting...');
    }, server));
    // reconnect
    socket.on('reconnect', nodeproxy(function(transport_type, reconnectionAttempts){
      console.log('reconnected to ' + this.name);
      that.startServer(this.name, server.settings);
    }, server));
    // reconnect_failed
    socket.on('reconnect_failed', nodeproxy(function(){
      console.log('Failed to reconnect to ' + this.name);
    }, server));
    // error
    socket.on('error', nodeproxy(function(msg){
      console.log('error: '+msg);
    }, server));
    // message
    socket.on('message', nodeproxy(function(msg, callback){
      console.log(msg);
    }, server));
  }
};

/*
module.exports = {
  _servers: {},
  _settings: {
    animate: true,
    warningLevel: 40
  },

  getServer: function(serverName){
    if(this._servers[serverName]) {
      return this._servers[serverName];
    }
    return null;
  },

  addServer: function(serverName, ip, port, start){
    if(!port) { port = 3007; }
    if(!start) { start = true; }
    
    var socket = ioClient.connect('http://' + ip + ':' + port, {
      'reconnect': true,
      'reconnection delay': 500,
      'max reconnection attempts': 5
    });

    var server = this._servers[serverName] = {
      name: serverName,
      ip: ip,
      port: port,
      socket: socket,
      cpuTimes: {},
      settings: {}
    };
    
    // sysInfo
    socket.on('sysInfo', nodeproxy(this.sysInfo, server));
    // loadInfo
    socket.on('loadInfo', nodeproxy(this.loadInfo, server));
    // diskspace
    socket.on('diskspace', nodeproxy(this.diskspace, server));
    
    this.addListeners(server);
    if(start) { this.startServer(serverName); }
  },

  sysInfo: function(data) {
    console.log(data.hostname);

  },
  loadInfo: function(data) {
    io.sockets.on('connection', function(_socket) {
    

      if (data.loadavg[0].toFixed(2) > 0.1) {
        var info = data.loadavg[0].toFixed(2);
        console.log(info);
        _socket.emit('notification', info);
      }
    });
  },
  
  addListeners: function(server){
    var that = this;
    var socket = server.socket;
    
    // connecting
    socket.on('connecting', nodeproxy(function(){
      console.log('connecting...');
    }, server));
    // connect
    socket.on('connect', nodeproxy(function(){
      console.log('connected');
    }, server));
    // connect_failed
    socket.on('connect_failed', nodeproxy(function(){
      console.log('Failed to connect to ' + this.name);
    }, server));
    // disconnect
    socket.on('disconnect', nodeproxy(function(){
      console.log('disconnected from ' + this.name);
    }, server));
    // reconnecting
    socket.on('reconnecting', nodeproxy(function(){
      console.log('reconnecting...');
    }, server));
    // reconnect
    socket.on('reconnect', nodeproxy(function(transport_type, reconnectionAttempts){
      console.log('reconnected to ' + this.name);
      that.startServer(this.name, server.settings);
    }, server));
    // reconnect_failed
    socket.on('reconnect_failed', nodeproxy(function(){
      console.log('Failed to reconnect to ' + this.name);
    }, server));
    // error
    socket.on('error', nodeproxy(function(msg){
      console.log('error: '+msg);
    }, server));
    // message
    socket.on('message', nodeproxy(function(msg, callback){
      console.log(msg);
    }, server));
  },
  
  diskspace: function(data){
    var used = data.total - data.free;
    var pct = data.total > 0 ? Math.round((used / data.total) * 100) : 0;
    return pct;
  },
  
  startServer: function(serverName, opts){
    if(!opts) { opts = {}; }
    var server = this.getServer(serverName);
    server.socket.emit('start', opts);
  },
  
  stopServer: function(serverName){
    var server = this.getServer(serverName);
    server.socket.emit('stop', {});
  },
  
  removeServer: function(serverName){
    var server = this.getServer(serverName);
    server.socket.emit('stop', {});
    server.socket.disconnect();
    delete this._servers[serverName];
  },
  
  startAll: function(){
    for(var i=0; i<this._servers.length; i++){
      var server = this._servers[i];
      this.startServer(server.name, server.settings);
    }
  },
  
  stopAll: function(){
    for(var i=0; i<this._servers.length; i++){
      this.stopServer(this._servers[i].name);
    }
  },
  
  log: function(msg){
    if(console) {
      console.log(msg);
    } else {
      $('#log').text(msg);
    }
  },
  
  _convertTime: function(ts){
    var totalSec = ts,
      days = parseInt(totalSec / 86400),
      hours = parseInt(totalSec / 3600) % 24,
      minutes = parseInt(totalSec / 60) % 60,
      seconds = parseInt(totalSec % 60);

    var result = (days > 0 ? days + ' days ' : '') + (hours < 10 ? "0" + hours : hours) + "hrs " + (minutes < 10 ? "0" + minutes : minutes) + "min " + (seconds  < 10 ? "0" + seconds : seconds) + 'sec';
    return result;
  }
};*/