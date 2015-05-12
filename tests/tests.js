var EntryPool = require('../pool.js');

exports.poolGetEmpty = function(test) {
    var pool = new EntryPool(0, 1);
    test.strictEqual(pool.size, 0);
    test.throws(function() {
        pool.get();
    });
    test.done();
};

exports.poolGetEmptyStep = function(test) {
    var pool = new EntryPool(0, 1, 1);
    test.strictEqual(pool.size, 0);
    test.notStrictEqual(pool.get(), undefined);
    test.strictEqual(pool.size, 1);
    test.strictEqual(pool.size, pool.pool.length);
    test.done();
};

exports.poolAddGet = function(test) {
    var pool = new EntryPool(0, 1);
    test.strictEqual(pool.size, 0);
    pool.add(1);
    test.strictEqual(pool.size, 1);
    test.strictEqual(pool.size, pool.pool.length);
    test.notStrictEqual(pool.get(), undefined);
    test.done();
};

exports.poolGetNoneLeft = function(test) {
    var pool = new EntryPool(1, 1);
    test.notStrictEqual(pool.get(), undefined);
    test.strictEqual(pool.size, 1);
    test.notStrictEqual(pool.get(), undefined);
    test.strictEqual(pool.size, 2);
    test.strictEqual(pool.size, pool.pool.length);
    test.done();
};

exports.poolGetNoneLeftCustomStep = function(test) {
    var pool = new EntryPool(1, 1, 3);
    test.notStrictEqual(pool.get(), undefined);
    test.strictEqual(pool.size, 1);
    test.notStrictEqual(pool.get(), undefined);
    //since we didn't put the original one back the size should be only 3 (step size)
    test.strictEqual(pool.size, 4);
    test.strictEqual(pool.size, pool.pool.length);
    test.done();
};

exports.poolPutGet = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    pool.put(arr);
    test.strictEqual(pool.get(), arr);
    test.strictEqual(pool.size, 1);
    test.done();
};

exports.arrAdd = function(test) {
    var pool = new EntryPool(1, 2),
        arr = pool.get();
    test.strictEqual(EntryPool.addEntry(arr, 1), 0);
    test.strictEqual(EntryPool.addEntry(arr, 2), 1);
    test.strictEqual(arr.at(0), 1);
    test.strictEqual(arr.at(1), 2);
    test.done();
};

exports.arrAddUndefined = function(test) {
    var pool = new EntryPool(1, 2),
        arr = pool.get();
    test.throws(function() {
        EntryPool.addEntry(arr, undefined);
    });
    test.done();
};

exports.arrRemove = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    test.strictEqual(EntryPool.removeEntry(arr, 2), false);
    test.strictEqual(EntryPool.removeEntry(arr, 1), true);
    test.strictEqual(EntryPool.numEntries(arr), 0);
    test.strictEqual(EntryPool.removeEntry(arr, undefined), true);
    test.done();
};

exports.arrRemoveShifts = function(test) {
    var pool = new EntryPool(1, 3),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    EntryPool.addEntry(arr, 2);
    EntryPool.addEntry(arr, 3);
    EntryPool.removeEntry(arr, 1);
    test.strictEqual(EntryPool.numEntries(arr), 2);
    test.strictEqual(arr.at(0), 2);
    test.strictEqual(arr.at(1), 3);
    test.strictEqual(arr.at(2), undefined);
    test.done();
};

exports.arrAddOverLimit = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    test.strictEqual(EntryPool.addEntry(arr, 2), -1);
    test.strictEqual(arr.at(0), 1);
    test.strictEqual(arr.at(1), undefined);
    test.done();
};

exports.arrNumEntries = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    test.strictEqual(EntryPool.numEntries(arr), 1);
    test.done();
};

exports.arrCleanup = function(test) {
    var pool = new EntryPool(1, 3),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    EntryPool.addEntry(arr, 2);
    EntryPool.addEntry(arr, 3);
    test.strictEqual(EntryPool.cleanupEntries(arr, 3), 1);
    test.strictEqual(EntryPool.numEntries(arr), 1);
    test.strictEqual(arr.at(0), 3);
    test.strictEqual(arr.at(1), undefined);
    test.strictEqual(arr.at(2), undefined);
    test.strictEqual(EntryPool.cleanupEntries(arr, 4), 0);
    test.strictEqual(EntryPool.numEntries(arr), 0);
    test.strictEqual(arr.at(0), undefined);
    test.done();
};

exports.arrCleanupUndefined = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    test.strictEqual(EntryPool.cleanupEntries(arr, undefined), 0);
    test.strictEqual(EntryPool.numEntries(arr), 0);
    test.done();
};

exports.poolPutEmpties = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    pool.put(arr);
    test.strictEqual(EntryPool.numEntries(arr), 0);
    test.done();
};

exports.poolPutEmpties = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    pool.put(arr);
    test.strictEqual(EntryPool.numEntries(arr), 0);
    test.done();
};

exports.poolPutInvalid = function(test) {
    var pool = new EntryPool(0, 1);
    test.throws(function() {
        pool.put('test');
    });
    test.done();
};

exports.poolPutInvalidSize = function(test) {
    var pool = new EntryPool(0, 1);
    test.throws(function() {
        pool.put(new Array(3));
    });
    test.done();
};

exports.poolPutArrayThrows = function(test) {
    var pool = new EntryPool(0, 1);
    test.throws(function() {
        pool.put(new Array(1));
    });
    test.strictEqual(pool.size, 0);
    test.done();
};

exports.poolPutPastEnd = function(test) {
    var pool = new EntryPool(0, 1),
        pool2 = new EntryPool(1, 1);
    pool.put(pool2.get());
    test.strictEqual(pool.size, 1);
    test.done();
};

exports.poolTrimAll = function(test) {
    var pool = new EntryPool(5, 1),
        arr = pool.get();
    pool.trim();
    test.strictEqual(pool.size, 1);
    test.strictEqual(pool.size, pool.pool.length);
    pool.put(arr);
    test.strictEqual(pool.size, 1);
    test.done();
};

exports.poolTrimAllButOne = function(test) {
    var pool = new EntryPool(5, 1),
        arr = pool.get();
    pool.trim(1);
    test.strictEqual(pool.size, 1);
    test.strictEqual(pool.size, pool.pool.length);
    pool.put(arr);
    test.strictEqual(pool.size, 1);
    test.done();
};

exports.poolTrimSome = function(test) {
    var pool = new EntryPool(5, 1),
        arr = pool.get();
    pool.trim(3);
    test.strictEqual(pool.size, 3);
    test.strictEqual(pool.size, pool.pool.length);
    pool.put(arr);
    test.strictEqual(pool.size, 3);
    test.done();
};

exports.poolTrimNone = function(test) {
    var pool = new EntryPool(1, 1);
    pool.trim(3);
    test.strictEqual(pool.size, 1);
    test.strictEqual(pool.size, pool.pool.length);
    test.done();
};

exports.poolTrimNoneAvailable = function(test) {
    var pool = new EntryPool(4, 1),
        arr1 = pool.get(),
        arr2 = pool.get();
    pool.get();
    pool.get();
    pool.trim();
    test.strictEqual(pool.size, 4);
    test.strictEqual(pool.size, pool.pool.length);
    //now put 2 back and try trimming again
    pool.put(arr1);
    pool.put(arr2);
    pool.trim();
    test.strictEqual(pool.size, 2);
    test.strictEqual(pool.size, pool.pool.length);
    test.done();
};

exports.poolTrimDoesntChangeOrder = function(test) {
    var pool = new EntryPool(3, 1),
        arr1 = pool.get(),
        arr2 = pool.get();
    pool.get();
    pool.trim();
    //now put 2 back and try trimming again
    pool.put(arr1);
    pool.put(arr2);
    pool.trim(2);
    test.strictEqual(pool.size, 2);
    test.strictEqual(pool.size, pool.pool.length);
    test.strictEqual(pool.get(), arr1);
    test.done();
};
