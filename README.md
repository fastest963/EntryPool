# EntryPool #

Simple array pooling with entry (i.e. time) adding/counting for simple rate limiting. See the example
at the bottom for help with using this for rate limiting.

## Docs ##

### new EntryPool(initialSize, arrayLength) ###
Returns a new pool of arrays of length `arrayLength` with an initial size of `initialSize`.

### pool.get(array) ###
Gets a new array of length `arrayLength` from the pool.

### pool.put(array) ###
Puts back an array once its done being used.

### pool.add([num]) ###
Adds `num` arrays of length `arrayLength` to the pool. If no `num` is passed, it will double the pool.

### EntryPool.addEntry(array, entry) ###
Adds `entry` to `array`. You should add an entry for each thing you want to limit.
Returns the index at which `entry` was added or -1 if `array` is full.

### EntryPool.removeEntry(array, entry) ###
Removes `entry` to `array`. Returns `true` if `array` is now empty.

### EntryPool.cleanupEntries(array, maxEntry) ###
Removes any entries less than `maxEntry` from `array`. Returns number of entries left.

### EntryPool.numEntries(array) ###
Removes the number of entries in `array`.

## Example ##

```JS
var connectionsPerIP = {},
    //only allow up to 5 connections every minute
    maxAllowedConnections = 5,
    maxAllowedTimeframe = 60 * 1000,
    pool = new EntryPool(100, maxAllowedConnections),; 

// server is a http.Server
server.on('connection', function(socket) {
    var now = Date.now(),
        ip = socket.remoteAddress;
    if (!connectionsPerIP[ip]) {
        connectionsPerIP[ip] = pool.get();
    } else {
        // remove any entries older than the allowed timeframe
        EntryPool.cleanupEntries(connectionsPerIP[ip], now - maxAllowedTimeframe);
    }
    // store that they just connected
    if (EntryPool.addEntry(connectionsPerIP[ip], now) < 0) {
        // the user is over the rate-limit so end the connection immediately 
        socket.end();
        return;
    }
    socket.on('close', function() {
        // if the array is now empty then we need to remove it
        if (EntryPool.cleanupEntries(connectionsPerIP[ip], now - maxAllowedTimeframe) === 0) {
            pool.put(connectionsPerIP[ip]);
            delete connectionsPerIP[ip];
        }
    });
};
    
// if a connection was open for less than maxAllowedTimeframe then we didn't remove the entry from
// the array when they closed. this interval will cleanup any that are expired
setInterval(function() {
    var cleanupIfBefore = Date.now() - maxAllowedTimeframe;
    for (var ip in connectionsPerIP) {
        if (EntryPool.cleanupEntries(connectionsPerIP[ip], cleanupIfBefore) === 0) {
            pool.put(connectionsPerIP[ip]);
            delete connectionsPerIP[ip];
        }
    }
}, 10 * maxAllowedTimeframe);

```

By [James Hartig](https://github.com/fastest963/)
