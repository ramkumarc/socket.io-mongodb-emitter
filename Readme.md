
# socket.io-mongodb-emitter

`socket.io-mongodb-emitter` is an mongodb implementation of `socket-io-emitter`

*This module is modified from [socket.io-emitter](https://github.com/Automattic/socket.io-emitter) with help of [socket.io-adapter-mongo](https://github.com/modit/socket.io-adapter-mongo)

## How to use

```js
var io = require('socket.io-mongodb-emitter')({ host: 'localhost', port: 27017, db: 'test' });
setInterval(function(){
  io.emit('time', new Date);
}, 5000);
```

## API

### Emitter(uri[, opts])

`uri` is a string that matches a mongodb connection string
```
mongodb://localhost:27017
mongodb://user:pass@localhost:27017/test
localhost:27017
```

### Emitter(opts)

The following options are allowed:

- `key`: the name of the key to pub/sub events on as prefix (`socket.io`)
- `host`: host to connect to mongo on (`localhost`)
- `port`: port to connect to mongo on (`27017`)
- `db`: db to use in mongo (`mubsub`)
- `username`: username to connect to mongo with
- `password`: password to connect to mongo with
- `socket`: unix domain socket to connect to mongo (`"/tmp/mongo.sock"`). Will
  be used instead of the host and port options if specified.
- `client`: optional, the mubsub client to publish events on

### Emitter#to(room:String):Emitter
### Emitter#in(room:String):Emitter

Specifies a specific `room` that you want to emit to.


### Emitter#of(namespace:String):Emitter

Specifies a specific namespace that you want to emit to.

## License

MIT
