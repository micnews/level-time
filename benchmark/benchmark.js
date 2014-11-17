var levelTime = require('../index.js');
var MemDB = require('memdb');
var Benchmark = require('benchmark');
var Plan = require('test-plan');
var toArray = require('stream-to-array');

var db = MemDB();

var dbMonitored = MemDB();
var time = levelTime(dbMonitored);

time.on('start', function() {});
time.on('finish', function() {});

var suite = new Benchmark.Suite;

function makeFn(db) {
  var count = 100;

  return {
    defer: true,
    fn: function(deferred) {
      var plan = new Plan(count, function() {
        toArray(db.createReadStream(), function(data) {
          deferred.resolve();
        });
      });

      for (var i = 0; i < count; ++i) {
        db.put('a', 'b' + i, function() {
          plan.ok(true);
        });
      }
    }
  };
}

suite
  .add('DB', makeFn(db))
  .add('DB monitored', makeFn(dbMonitored))
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
  })
  .run({ async: true });
