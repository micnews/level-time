## SYNOPSIS
LevelUP response time logger

## USAGE

```js
var levelTime = require('level-time');

var time = levelTime(db);

time.on('start', function() {});
time.on('finish', function() {});
```

