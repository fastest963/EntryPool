function Pool(initialSize, arrayLen) {
    if (arrayLen < 1) {
        throw new Error('Invalid arrayLen. Must be greater than 0');
    }
    this.arrLength = arrayLen;
    this.size = 0;
    if (initialSize > 0) {
        this.add(initialSize);
    }
}

//defaults to doubling the pool
Pool.prototype.add = function(count) {
    var oldPool = this.pool,
        currentCount = oldPool ? oldPool.length : 0,
        finalCount = currentCount + (count || currentCount);
    if (finalCount < 1) {
        throw new Error("Trying to create a new Array pool with count 0");
    }
    this.pool = new Array(finalCount);
    //first copy over the old arrays
    for (i = 0; i < currentCount; i++) {
        this.pool[i] = oldPool[i];
    }
    //now add the new ones
    for (; i < finalCount; i++) {
        this.pool[i] = new Array(this.arrLength);
    }
    this.size = finalCount;
};

Pool.prototype.get = function() {
    var arr;
    for (var i = 0; i < this.pool.length; i++) {
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
    for (var i = 0; i < arr.length; i++) {
        arr[i] = undefined;
    }
}

Pool.prototype.put = function(arr) {
    emptyArray(arr);
    //put it back in the first available spot
    for (var i = 0; i < this.pool.length; i++) {
        if (this.pool[i] === null) {
            this.pool[i] = arr;
            break;
        }
    }
};

Pool.numEntries = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] === undefined) {
            break;
        }
    }
    return i;
};

//if the array is already full it will NOT add a time
//returns index it was added at, -1 if not
//if you didn't pass entry, return is the length of the array
Pool.addEntry = function addEntry(arr, entry) {
    if (entry === undefined) {
        return;
    }
    var i;
    for (i = 0; i < arr.length; i++) {
        if (arr[i] === undefined) {
            arr[i] = entry;
            return i;
        }
    }
    return -1;
};

//returns true if the array is now empty
Pool.cleanupEntries = function(arr, removeIfBefore) {
    //we're looping through arr and if we find a entry less than the entry sent, we're removing it
    //we need to keep all the data to the left so we're moving times back if they're still valid
    for (var i = 0, j = 0; i < arr.length; i++) {
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
        return;
    }
    //we're looping through arr and if we find a entry equal than the entry sent, we're removing it
    //we need to keep all the data to the left so we're moving times back if they're still valid
    for (var i = 0, j = 0; i < arr.length; i++) {
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