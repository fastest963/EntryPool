var EntryArray = require('./lib/array.js');

function Pool(initialSize, arrayLen, stepSize) {
    if (arrayLen < 1) {
        throw new Error('Invalid arrayLen. Must be greater than 0');
    }
    if (stepSize < 0) {
        throw new Error('Invalid stepSize. Must be greater than 0');
    }
    this.arrLength = +arrayLen;
    this.size = 0;
    this.stepSize = +stepSize || +initialSize || -1; //-1 means double current size
    if (initialSize > 0) {
        this.add(initialSize);
    }
}

Pool.prototype.add = function(count) {
    var oldPool = this.pool,
        currentCount = oldPool ? oldPool.length : 0,
        step = count > 0 ? count : (this.stepSize === -1 ? Math.min(1000, currentCount) : this.stepSize),
        finalCount = currentCount + step,
        i = 0;
    if (finalCount < 1) {
        throw new Error("Trying to create a new Array pool with count 0");
    }
    this.pool = new Array(finalCount);
    //first copy over the old arrays (but only non-null values)
    for (; i < currentCount; i++) {
        this.pool[i] = oldPool[i];
    }
    //now add the new ones
    for (; i < finalCount; i++) {
        this.pool[i] = new EntryArray(this.arrLength);
    }
    this.size = finalCount;
};

Pool.prototype.trim = function(minSize) {
    var len = this.pool ? this.pool.length : 0,
        i = len - 1,
        size = +minSize || 0,
        j = -1;
    if (size < 0) {
        throw new Error('Cannot trim to a negative size');
    }
    //the pool might look like [arr, arr, null, null, null, null, null, arr, arr]
    //we want to convert it first to [null, null, null, null, null, arr, arr, arr, arr]

    //first find the index of the first null (starting from the end)
    for (; i >= size; i--) {
        if (this.pool[i] === null) {
            j = i;
            break;
        }
    }
    //if we found any then start moving arrays back
    if (j > -1) {
        //find the first non-null before j and start putting them at j
        for (; i >= 0 && j >= size; i--) {
            if (this.pool[i] !== null) {
                this.pool[j] = this.pool[i];
                this.pool[i] = null;
                j--;
            }
        }
        //add one so we don't remove the current index (since j is pointed at the last null)
        j += 1;
    } else {
        //since we didn't find any nulls before size, just delete from size onwards
        j = size;
    }
    if (j >= size && j < len) {
        this.pool.splice(j, len - j);
        this.size = j;
    }
};

Pool.prototype.get = function() {
    var i = 0,
        len = this.pool ? this.pool.length : 0,
        arr = null;
    for (; i < len; i++) {
        if (this.pool[i] !== null) {
            arr = this.pool[i];
            this.pool[i] = null;
            break;
        }
    }
    if (!arr) {
        //double the pool then get one
        this.add();
        arr = this.get();
    }
    return arr;
};

Pool.prototype.put = function(arr) {
    var i = 0,
        len = this.pool ? this.pool.length : 0;
    if (!(arr instanceof EntryArray)) {
        throw new TypeError('Invalid array was sent to pool.put. Must be instance of EntryArray');
    }
    if (arr.size != this.arrLength) {
        throw new Error('An array of invalid size was sent to pool.put');
    }
    arr.empty();
    //put it back in the first available spot
    for (; i < len; i++) {
        if (this.pool[i] === null) {
            this.pool[i] = arr;
            return;
        }
    }
    //we didn't have room for it; add it to the end
    if (this.pool == null) {
        this.pool = [];
    }
    this.pool.push(arr);
    this.size++;
};

/**
 * Backwards-compatible methods
 */
Pool.numEntries = function(arr) {
    if (!(arr instanceof EntryArray)) {
        throw new TypeError('Invalid array was sent to numEntries. Must be instance of EntryArray');
    }
    return arr.numEntries();
};
Pool.addEntry = function(arr, timestamp) {
    if (!(arr instanceof EntryArray)) {
        throw new TypeError('Invalid array was sent to addEntry. Must be instance of EntryArray');
    }
    return arr.addEntry(timestamp);
};
Pool.cleanupEntries = function(arr, removeIfBefore) {
    if (!(arr instanceof EntryArray)) {
        throw new TypeError('Invalid array was sent to cleanupEntries. Must be instance of EntryArray');
    }
    return arr.cleanupEntries(removeIfBefore);
};
Pool.removeEntry = function(arr, timestamp) {
    if (!(arr instanceof EntryArray)) {
        throw new TypeError('Invalid array was sent to removeEntry. Must be instance of EntryArray');
    }
    return arr.removeEntry(timestamp);
};

module.exports = Pool;