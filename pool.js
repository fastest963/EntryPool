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
        this.pool[i] = new Array(this.arrLength);
    }
    this.size = finalCount;
};

Pool.prototype.trim = function(minSize) {
    var len = this.pool ? this.pool.length : 0,
        i = len - 1,
        size = +minSize || 0;
    if (size < 0) {
        throw new Error('Cannot trim to a negative size');
    }
    for (;i >= size; i--) {
        if (this.pool[i] === null) {
            break;
        }
    }
    if (i + 1 < len) {
        //substract one so we don't remove the current index
        this.pool.splice(i + 1, len - i - 1);
        this.size = i + 1;
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

function emptyArray(arr) {
    var i = 0;
    for (; i < arr.length; i++) {
        arr[i] = undefined;
    }
}

Pool.prototype.put = function(arr) {
    var i = 0,
        len = this.pool ? this.pool.length : 0;
    if (!Array.isArray(arr)) {
        throw new TypeError('Non-array was sent to pool.put');
    }
    if (arr.length != this.arrLength) {
        throw new Error('An array of invalid size was sent to pool.put');
    }
    emptyArray(arr);
    //put it back in the first available spot
    for (; i < len; i++) {
        if (this.pool[i] === null) {
            this.pool[i] = arr;
            return;
        }
    }
    //we didn't have room for it; add it to the end
    if (this.pool == null) {
        this.pool = []
    }
    this.pool.push(arr);
    this.size++;
};

Pool.numEntries = function(arr) {
    var i = 0;
    for (; i < arr.length; i++) {
        if (arr[i] === undefined) {
            break;
        }
    }
    return i;
};

//if the array is already full it will NOT add a time
//returns index it was added at, -1 if not
Pool.addEntry = function addEntry(arr, entry) {
    if (entry === undefined) {
        throw new TypeError('Entry cannot be undefined in addEntry');
    }
    var i = 0;
    for (; i < arr.length; i++) {
        if (arr[i] === undefined) {
            arr[i] = entry;
            return i;
        }
    }
    return -1;
};

//returns number left in arr
//if removeIfBefore is undefined, it'll delete all entries
Pool.cleanupEntries = function(arr, removeIfBefore) {
    if (removeIfBefore === undefined) {
        emptyArray(arr);
        return 0;
    }
    //we're looping through arr and if we find a entry less than the entry sent, we're removing it
    //we need to keep all the data to the left so we're moving times back if they're still valid
    var i = 0, j = 0;
    for (; i < arr.length; i++) {
        if (arr[i] === undefined) {
            break;
        }
        if (arr[i] < removeIfBefore) {
            arr[i] = undefined;
        } else {
            //if we need to move it back, do that now
            if (i !== j) {
                arr[j] = arr[i];
                arr[i] = undefined;
            }
            j++;
        }
    }
    return j;
};

//returns true if the array is now empty
Pool.removeEntry = function(arr, entry) {
    if (entry === undefined) {
        return (this.numEntries(arr) === 0);
    }
    //we're looping through arr and if we find a entry equal than the entry sent, we're removing it
    //we need to keep all the data to the left so we're moving times back if they're still valid
    var i = 0, j = 0;
    for (; i < arr.length; i++) {
        if (arr[i] === undefined) {
            break;
        }
        if (arr[i] === entry) {
            arr[i] = undefined;
        } else {
            //if we need to move it back, do that now
            if (i !== j) {
                arr[j] = arr[i];
                arr[i] = undefined;
            }
            j++;
        }
    }
    return (j === 0);
};

module.exports = Pool;