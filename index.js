
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

  // if passed object
  if (typeof uri == 'object') {
    opts = uri;
  }

  var socket = opts.socket;
  var client = opts.client;
  // init clients if needed
  if (!client) client = socket ? mubsub(socket) : mubsub(uri, opts.mongoOpts);

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

  // isolate callback and remove it from the rest of the data
  var cb = null;
  if(args.length === 3){
    cb = args[2];
    delete args[2]
  }

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
  }])}, onPublishComplete);

  function onPublishComplete(){
    if (typeof(cb) === "function") {
      cb();
    };
  };

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