## SYNOPSIS
LevelUP response time logger

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

Data description:

- *name* - operation name (e.g. createReadStream)
- *args* - arguments array
- *chunksCount* - processed chunks count for streaming operations, 1 for others
- *firstChunkTime* - time interval from operation creation to first received chunk (ms or Infinity if there are no chunks received)
- *totalTime* - total operation time (ms or Infinity if operation is still in progress or never finished)
- *start* - operation start date
- *end* - operation end/finish date (or null if operation is still in progress or never finished)
- *batchSize* - number of items for batches, 1 for other operations
- *parallel* - number of unfinished operations at the event time
