
# socket.io-mongodb-emitter

`socket.io-mongodb-emitter` is an mongodb implementation of `socket-io-emitter`

*This module is modified from [socket.io-emitter](https://github.com/Automattic/socket.io-emitter) with help of [socket.io-adapter-mongo](https://github.com/modit/socket.io-adapter-mongo)

## How to use

```js
var io = require('socket.io-mongodb-emitter')('mongodb://localhost:27017');
setInterval(function(){
  io.emit('time', new Date);
}, 5000);
```

Update 5/31/2017 - Versions prior to 1.0 allowed an object to be passed which was used to build a URI. This caused problems when using replica sets and caused warnings when MongoDB change the client API. In the interest of simplicity and futureproofing the internal URI construction has been eliminated and it is now required that a valid mongo URI be passed.

## API

### Emitter(uri[, opts])

`uri` is a string that matches a mongodb connection string
```
mongodb://localhost:27017/test
mongodb://user:pass@localhost:27017/test
mongodb://user:pass@host1:27017,host2:27017,host3:27017/test
```

### Emitter(opts)

The following options are allowed:

- `key`: the name of the key to pub/sub events on as prefix (`socket.io`)
- `socket`: unix domain socket to connect to mongo (`"/tmp/mongo.sock"`). Will
  be used instead of the host and port options if specified.
- `client`: optional, the mubsub client to publish events on
- `mongoOpts`: optional, mongodb connection options. only applicable if URI is used

### Emitter#to(room:String):Emitter
### Emitter#in(room:String):Emitter

Specifies a specific `room` that you want to emit to.


### Emitter#of(namespace:String):Emitter

Specifies a specific namespace that you want to emit to.

## License

MIT
