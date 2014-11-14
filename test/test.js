process.env.NODE_ENV = 'test';

var async = require('async');
var expect = require('chai').expect;
var levelTime = require('../index.js');
var MemDB = require('memdb');
var db = MemDB();
var time = levelTime(db);
var assert = require('assert');
var Plan = require('test-plan');

describe('Level-time', function() {
  it('should be able to monitor createReadStream when database is empty', function(done) {
    var plan = new Plan(2, done);

    time.once('start', function(obj) {
      expect(obj.start).to.be.a('date');
      expect(obj.end).to.equal(null);
      expect(obj.chunksCount).to.equal(0);
      expect(obj.batchSize).to.equal(1);
      expect(obj.parallel).to.equal(1);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.start).to.be.a('date');
      expect(obj.end).to.be.a('date');
      expect(obj.chunksCount).to.equal(0);
      expect(obj.batchSize).to.equal(1);
      expect(obj.parallel).to.equal(1);
      plan.ok(true);
    });

    db.createReadStream();
  });

  it('should be able to monitor createKeyStream when database is empty', function(done) {
    var plan = new Plan(2, done);

    time.once('start', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    db.createKeyStream();
  });

  it('should be able to monitor createValueStream when database is empty', function(done) {
    var plan = new Plan(2, done);

    time.once('start', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    db.createValueStream();
  });

  it('should be able to monitor createReadStream and receive chunk of data', function(done) {
    var plan = new Plan(2, done);

    db.put('a', 'b', function() {
      time.once('start', function(obj) {
        expect(obj.chunksCount).to.equal(0);
        expect(obj.firstChunkTime).to.equal(Infinity);
        expect(obj.batchSize).to.equal(1);
        plan.ok(true);
      });

      time.once('finish', function(obj) {
        expect(obj.chunksCount).to.equal(1);
        expect(obj.firstChunkTime).not.to.equal(Infinity);
        expect(obj.batchSize).to.equal(1);
        plan.ok(true);
      });

      db.createKeyStream();
    });
  });

  it('should be able to monitor put operation', function(done) {
    var plan = new Plan(3, done);

    time.once('start', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.chunksCount).to.equal(1);
      expect(obj.firstChunkTime).not.to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    db.put('a', 'b', function(err) {
      expect(err).to.not.exist;
      plan.ok(true);
    });
  });

  it('should be able to monitor get operation', function(done) {
    var plan = new Plan(3, done);

    time.once('start', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.chunksCount).to.equal(1);
      expect(obj.firstChunkTime).not.to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    db.get('a', function(err, value) {
      expect(err).to.not.exist;
      expect(value).to.equal('b');
      plan.ok(true);
    });
  });

  it('should be able to monitor del operation', function(done) {
    var plan = new Plan(3, done);

    time.once('start', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.chunksCount).to.equal(1);
      expect(obj.firstChunkTime).not.to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    db.del('a', function(err) {
      expect(err).to.not.exist;
      plan.ok(true);
    });
  });

  it('should be able to monitor createWriteStream operation', function(done) {
    var plan = new Plan(2, done);

    time.once('start', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.chunksCount).to.equal(4);
      expect(obj.firstChunkTime).not.to.equal(Infinity);
      expect(obj.batchSize).to.equal(1);
      plan.ok(true);
    });

    var ws = db.createWriteStream();
    ws.write({ key: 'k1', value: 'v1' })
    ws.write({ key: 'k2', value: 'v2' })
    ws.write({ key: 'k3', value: 'v3' })
    ws.write({ key: 'k4', value: 'v4' })
    ws.end();
  });

  it('should be able to monitor batch operation', function(done) {
    var plan = new Plan(3, done);

    time.once('start', function(obj) {
      expect(obj.chunksCount).to.equal(0);
      expect(obj.firstChunkTime).to.equal(Infinity);
      expect(obj.batchSize).to.equal(3);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.chunksCount).to.equal(1);
      expect(obj.firstChunkTime).not.to.equal(Infinity);
      expect(obj.batchSize).to.equal(3);
      plan.ok(true);
    });

    db.batch([
      { type: 'put', key: 'b', value: 'c' },
      { type: 'put', key: 'd', value: 'e' },
      { type: 'put', key: 'f', value: 'g' }
    ], function(err) {
      expect(err).to.not.exist;
      plan.ok(true);
    });
  });

  it('should pass the same object to start and finish events', function(done) {
    var startObj;
    var finishObj;

    var plan = new Plan(2, function() {
      expect(startObj).to.equal(finishObj);
      done();
    });

    time.once('start', function(obj) {
      startObj = obj;
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      finishObj = obj;
      plan.ok(true);
    });

    var ws = db.createWriteStream();
    ws.write({ key: 'k1', value: 'v1' })
    ws.write({ key: 'k2', value: 'v2' })
    ws.end();
  });

  it('should count parallel operations', function(done) {
    var plan = new Plan(2, done);

    db.put('x', '1', function(err) {
      expect(err).to.not.exist;
    });

    db.put('y', '2', function(err) {
      expect(err).to.not.exist;
    });

    time.once('start', function(obj) {
      expect(obj.parallel).to.equal(3);
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      expect(obj.parallel).to.equal(3);
      plan.ok(true);
    });

    db.put('z', '3', function(err) {
      expect(err).to.not.exist;
    });
  });
});
