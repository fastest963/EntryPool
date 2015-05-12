function Entry(ts, val) {
    this.ts = ts;
    //yes this will make 2 different hidden classes
    if (val !== undefined) {
        this.val = val;
    }
}
Entry.prototype.value = function() {
    if (this.val === undefined) {
        return this.ts;
    }
    return this.val;
};
Entry.prototype.clear = function() {
    this.ts = 0;
    if (this.hasOwnProperty('val')) {
        this.val = undefined;
    }
};

//keep around a set number of unused entries to speed up adding/removing
//by default we will just set this to 25
function UnusedEntriesPool() {
    this.size = 25;
    this.pool = new Array(this.size);
    this.pos = -1; //the position of the next available unused entry
}
UnusedEntriesPool.prototype.get = function() {
    if (this.pos < 0 || this.pos >= this.size) {
        return undefined;
    }
    var entry = this.pool[this.pos];
    this.pool[this.pos] = null;
    this.pos--;
    return entry;
};
UnusedEntriesPool.prototype.put = function(entry) {
    if ((this.pos + 1) >= this.size) { //pool is full
        return;
    }
    this.pos++;
    entry.clear();
    this.pool[this.pos] = entry;
};

function EntryArray(arraySize) {
    this.arr = new Array(arraySize);
    this.size = arraySize;
    this.length = 0;
    this.unusedPool = new UnusedEntriesPool();
}

EntryArray.prototype.at = function(index) {
    var entry = this.arr[index];
    if (entry !== undefined) {
        return entry.value();
    }
    return;
};

EntryArray.prototype.numEntries = function() {
    return this.length;
};

//if the array is already full it will NOT add a time
//returns index it was added at, -1 if not
EntryArray.prototype.addEntry = function(timestamp, value) {
    if (timestamp === undefined && value === undefined) {
        throw new TypeError('Timestamp and value cannot be undefined in addEntry');
    }
    var arr = this.arr,
        entry = this.unusedPool.get(),
        ts = timestamp || Date.now(),
        i = 0;
    if (entry === undefined) {
        entry = new Entry(ts, value);
    } else {
        entry.ts = ts;
        if (value !== undefined) {
            entry.val = value;
        }
    }
    for (; i < arr.length; i++) {
        if (arr[i] === undefined) {
            arr[i] = entry;
            this.length++;
            return i;
        }
    }
    return -1;
};
EntryArray.prototype.push = EntryArray.prototype.addEntry;

//returns number left in arr
//if removeIfBefore is undefined, it'll delete all entries
EntryArray.prototype.cleanupEntries = function(removeIfBefore) {
    if (removeIfBefore === undefined) {
        this.empty();
        return 0;
    }
    if (typeof removeIfBefore !== 'number') {
        throw new TypeError('removeIfBefore must be a number in cleanupEntries');
    }
    //we're looping through arr and if we find a entry less than the entry sent, we're removing it
    //we need to keep all the data to the left so we're moving times back if they're still valid
    var arr = this.arr,
        i = 0, j = 0;
    for (; i < arr.length; i++) {
        if (arr[i] === undefined) {
            break;
        }
        if ((arr[i] instanceof Entry && arr[i].ts < removeIfBefore) || (typeof arr[i] === 'number' && arr[i] < removeIfBefore)) {
            arr[i] = undefined;
            continue;
        }
        //if we need to move it back, do that now
        if (i !== j) {
            arr[j] = arr[i];
            arr[i] = undefined;
        }
        j++;
    }
    this.length = j;
    return j;
};
EntryArray.prototype.cleanup = EntryArray.prototype.cleanupEntries;

EntryArray.prototype.empty = function() {
    var arr = this.arr,
        i = 0;
    for (; i < arr.length; i++) {
        if (arr[i] !== undefined) {
            arr[i] = undefined;
        }
    }
    this.length = 0;
};

EntryArray.prototype.removeEntry = function(timestamp, value) {
    if (timestamp === undefined && value === undefined) {
        return (this.numEntries() === 0);
    }
    //we're looping through arr and if we find a entry equal than the entry sent, we're removing it
    //we need to keep all the data to the left so we're moving times back if they're still valid
    var hasValue = value !== undefined,
        hasTimestamp = timestamp !== undefined,
        arr = this.arr,
        i = 0, j = 0;
    for (; i < arr.length; i++) {
        if (arr[i] === undefined) {
            break;
        }
        if ((hasTimestamp && (arr[i] === timestamp || arr[i].ts === timestamp)) || (hasValue && arr[i].val === value)) {
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
    this.length = j;
    return (j === 0);
};

module.exports = EntryArray;