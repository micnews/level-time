## SYNOPSIS
[LevelUP](https://github.com/rvagg/node-levelup) operations time logger

[![Build Status](https://travis-ci.org/micnews/level-time.svg?branch=master)](https://travis-ci.org/micnews/level-time)

## USAGE

```js
var levelTime = require('level-time');

var time = levelTime(db);

// Attach event handler to run on levelup operation start
time.on('start', function(op) {
  console.log(op);
  /* { name: 'createReadStream',
       args: [],
       chunksCount: 0,
       firstChunkTime: Infinity,
       totalTime: Infinity,
       start: Fri Nov 14 2014 16:46:33 GMT+0200 (EET),
       end: null,
       batchSize: 1,
       parallel: 1 } */
  });

// Attach event handler to run on levelup operation finish
time.on('finish', function(op) {
  console.log(op);
  /* { name: 'createReadStream',
       args: [],
       chunksCount: 0,
       firstChunkTime: Infinity,
       totalTime: 9,
       start: Fri Nov 14 2014 16:46:33 GMT+0200 (EET),
       end: Fri Nov 14 2014 16:46:33 GMT+0200 (EET),
       batchSize: 1,
       parallel: 1 } */
});
```

*Note: the same object passed to both `start` and `finish` events, so it's safe to add custom properties to it.*

Operation object properties description:

- *name* - operation name (e.g. createReadStream)
- *args* - arguments array
- *chunksCount* - processed chunks count for streaming operations, 1 for others
- *firstChunkTime* - time interval from operation creation to first received chunk (ms or Infinity if there are no chunks received)
- *totalTime* - total operation time (ms or Infinity if operation is still in progress or never finished)
- *start* - operation start date
- *end* - operation end/finish date (or null if operation is still in progress or never finished)
- *batchSize* - number of items for batches, 1 for other operations
- *parallel* - number of unfinished operations at the event time including current one

##PERFORMANCE

Run `npm run benchmark` to benchmark module performance overhead. It uses MemDB internally.

Results on my machine (around 70% of original MemDB performance):

```
DB x 465 ops/sec ±1.31% (82 runs sampled)
DB monitored x 326 ops/sec ±2.79% (75 runs sampled)
Fastest is DB
```

##LICENSE

MIT
