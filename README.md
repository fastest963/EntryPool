# EntryPool #

Simple array pooling with entry (i.e. time) adding/counting for simple rate limiting. See
the example at the bottom for help with using this for rate limiting.

## EntryPool Methods ##

### pool = new EntryPool(initialSize, arrayLength[,stepSize]) ###
Returns a new pool of arrays of length `arrayLength` with an initial size of `initialSize`.
`stepSize` is used when adding to the poll and defaults to `initialSize` or "double pool".

### pool.get() ###
Gets a new `EntryArray` of length `arrayLength` from the pool.

### pool.put(array) ###
Puts back an `EntryArray` once its done being used.

### pool.add([num]) ###
Adds `num` arrays of length `arrayLength` to the pool. If no `num` is passed, it will
use the step size.

### pool.trim([minSize]) ###
Reduces pool size to at least `minSize` (or 0) by removing unused arrays from the pool.

## EntryArray Methods ##

### arr.add(timestamp[, value]) ###
Adds an entry to the array. You should add an entry for each thing you want to limit.
Returns the index at which entry was added or -1 if array is full.

### arr.remove([timestamp][, value]) ###
Removes an entry from array. Returns `true` if array is now empty. `timestamp` and `value`
are both optional and to omit `timestamp` but send `value` pass `undefined` as `timestamp`.

### arr.cleanup(maxEntry) ###
Removes any entries with a timestamp older than `maxEntry` from array. Returns number of
entries left.

### arr.numEntries() ###
Removes the number of entries in array.

## Example ##

```JS
var connectionsPerIP = {},
    //only allow up to 5 connections every minute
    maxAllowedConnections = 5,
    maxAllowedTimeframe = 60 * 1000,
    pool = new EntryPool(100, maxAllowedConnections); 

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
