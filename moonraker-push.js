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