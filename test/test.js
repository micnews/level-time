process.env.NODE_ENV = 'test';

var async = require('async');
var expect = require('chai').expect;
var sinon = require('sinon');
var levelTime = require('../index.js');
var MemDB = require('memdb');
var db = MemDB();
var time = levelTime(db);
var assert = require('assert');
var Plan = require('test-plan');

describe('Level-time', function() {
  it('should be able to monitor createReadStream', function(done) {
    var plan = new Plan(2, done);

    async.series([
      function() {},
      function() {}
    ])

    time.once('start', function(obj) {
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      plan.ok(true);
    });

    db.createReadStream();
  });

  it('should be able to monitor createKeyStream', function(done) {
    var plan = new Plan(2, done);

    async.series([
      function() {},
      function() {}
    ])

    time.once('start', function(obj) {
      plan.ok(true);
    });

    time.once('finish', function(obj) {
      plan.ok(true);
    });

    db.createKeyStream();
  });
});
