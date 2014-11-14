var EventEmitter = require('events').EventEmitter;
var createManifest = require('level-manifest');
var fwd = require('forward-events');
var through2 = require('through2');

function trackCallback(args, fn) {
  var cb = args.length > 0 ? args[args.length - 1] : null;

  if ('function' !== typeof cb) {
    args.push(fn);
    return;
  }

  args[args.length - 1] = function() {
    fn.apply(this, arguments);
    return cb.apply(this, arguments);
  };
}

var parallel = 0;

function patch(m, db, name, events) {
  var type = m.methods[name].type;
  var orig = db[name];
  var isStream = ['readable', 'writable', 'stream'].indexOf(type) > -1;
  var isBatch = 'batch' === name;

  db[name] = function() {
    var args = Array.prototype.slice.call(arguments, 0);
    var startTime = new Date();
    var finished = false;

    var obj = {
      name: name,
      args: args,
      chunksCount: 0,
      firstChunkTime: Infinity,
      totalTime: Infinity,
      start: startTime,
      end: null,
      batchSize: 1,
      parallel: 0
    };

    if (isBatch && args.length > 0 && Array.isArray(args[0])) {
      obj.batchSize = args[0].length;
    }

    function start() {
      obj.parallel = ++parallel;
      events.emit('start', obj);
    }

    function finish() {
      if (finished) {
        return;
      }

      finished = true;
      obj.end = new Date();
      obj.totalTime = obj.end - startTime;
      obj.parallel = parallel--;
      events.emit('finish', obj);
    }

    if (isStream) {
      stream = orig.apply(db, args);
      var s = stream.pipe(through2.obj(function(chunk, enc, callback) {
        this.push(chunk);
        if (Infinity === obj.firstChunkTime) {
          obj.firstChunkTime = new Date() - startTime;
        }
        ++obj.chunksCount;
        callback();
      }, function(callback) {
        finish();
        callback();
      }));

      start();
      return s;
    } else {
      trackCallback(args, function() {
        obj.firstChunkTime = new Date() - startTime;
        obj.chunksCount = 1;
        finish();
      });

      start();
      return orig.apply(db, args);
    }
  };
}

function monitor(db, opts) {
  opts = opts || {};
  var events = new EventEmitter();
  var m = createManifest(db);

  [
    'put',
    'del',
    'get',
    'batch',
    'createReadStream',
    'createKeyStream',
    'createValueStream',
    'createWriteStream'
  ]
  .forEach(function(name) {
    if (m.methods[name]) {
      patch(m, db, name, events);
    }
  });

  if (m.sublevels && opts.sublevel) {
    Object.keys(m.sublevels).forEach(function(name) {
      var sub = monitor(db.sublevel(name), { sublevel: name });
      fwd(sub, events);
    });
  }

  return events;
}

module.exports = monitor;
