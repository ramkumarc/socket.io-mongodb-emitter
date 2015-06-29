
/**
 * Module dependencies.
 */
var mubsub = require('mubsub');
var uid = require('uid2')(6);
var parser = require('socket.io-parser');
var hasBin = require('has-binary-data');
var msgpack = require('msgpack-js').encode;
var debug = require('debug')('socket.io-mongodb-emitter');
var mongodbUri = require('mongodb-uri');
var util = require('util');


/**
 * Module exports.
 */

module.exports = Emitter;

/**
 * Flags.
 *
 * @api public
 */

var flags = [
  'json',
  'volatile',
  'broadcast'
];

/**
 * Socket.IO mongodb based emitter.
 *
 * @param {Object} uri (mongo)(optional)
 * @param {Object} opts
 * @api public
 */

function Emitter(uri, opts){
  if (!(this instanceof Emitter)) return new Emitter(uri, opts);
  opts = opts || {};

  // handle options only
  if ('object' == typeof uri) {
    opts = uri;
    uri = null;
  }

  // handle uri string
  if (uri) {

    // ensure uri has mongodb scheme
    if (uri.indexOf('mongodb://') !== 0) {
      uri = 'mongodb://' + uri;
    }

    // Parse to uri into an object
    var uriObj = mongodbUri.parse(uri);
    if (uriObj.username && uriObj.password) {
      opts.username = uriObj.username;
      opts.password = uriObj.password;
    }
    opts.host = uriObj.hosts[0].host;
    opts.port = uriObj.hosts[0].port;
    opts.db = uriObj.database;
  }

  // opts
  var socket = opts.socket;
  var creds = (opts.username && opts.password) ? opts.username + ':' + opts.password + '@' : '';
  var host = opts.host || '127.0.0.1';
  var port = Number(opts.port || 27017);
  var db = opts.db || 'mubsub';

  var client = opts.client;

  // init clients if needed
  if (!client) client = socket ? mubsub(socket) : mubsub('mongodb://' + creds + host + ':' + port + '/' + db);

  this.client = client;
  this.key = (opts.key || 'socket.io');
  this.channel = this.client.channel(this.key);

  this._rooms = [];
  this._flags = {};
}

/**
 * Apply flags from `Socket`.
 */

flags.forEach(function(flag){
  Emitter.prototype.__defineGetter__(flag, function(){
    debug('flag %s on', flag);
    this._flags[flag] = true;
    return this;
  });
});

/**
 * Limit emission to a certain `room`.
 *
 * @param {String} room
 */

Emitter.prototype.in =
Emitter.prototype.to = function(room){
  if (!~this._rooms.indexOf(room)) {
    debug('room %s', room);
    this._rooms.push(room);
  }
  return this;
};

/**
 * Limit emission to certain `namespace`.
 *
 * @param {String} namespace
 */

Emitter.prototype.of = function(nsp) {
  debug('nsp set to %s', nsp);
  this._flags.nsp = nsp;
  return this;
};

/**
 * Send the packet.
 *
 * @api private
 */

Emitter.prototype.emit = function(){
  // packet
  var args = Array.prototype.slice.call(arguments);
  var packet = {};
  packet.type = hasBin(args) ? parser.BINARY_EVENT : parser.EVENT;
  packet.data = args;
  // set namespace to packet
  if (this._flags.nsp) {
    packet.nsp = this._flags.nsp;
    delete this._flags.nsp;
  } else {
    packet.nsp = '/';
  }

  // publish
  this.channel.publish(this.key, { uid: uid, data: msgpack([packet, {
    rooms: this._rooms,
    flags: this._flags
  }])});

  // reset state
  this._rooms = [];
  this._flags = {};

  return this;
};

/**
 * Close the client connection
 *
 * @api private
 */

Emitter.prototype.close = function(){
  this.client.close();
};
