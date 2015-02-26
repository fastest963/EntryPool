var EntryPool = require('../pool.js');

exports.poolGetEmpty = function(test) {
    var pool = new EntryPool(0, 1);
    test.strictEqual(pool.size, 0);
    test.throws(function() {
        pool.get();
    });
    test.done();
};

exports.poolAddGet = function(test) {
    var pool = new EntryPool(0, 1);
    test.strictEqual(pool.size, 0);
    pool.add(1);
    test.strictEqual(pool.size, 1);
    test.notStrictEqual(pool.get(), undefined);
    test.done();
};

exports.poolGetNoneLeft = function(test) {
    var pool = new EntryPool(1, 1);
    test.notStrictEqual(pool.get(), undefined);
    test.strictEqual(pool.size, 1);
    test.notStrictEqual(pool.get(), undefined);
    test.strictEqual(pool.size, 2);
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
    EntryPool.addEntry(arr, 1);
    EntryPool.addEntry(arr, 2);
    test.strictEqual(arr[0], 1);
    test.strictEqual(arr[1], 2);
    test.done();
};

exports.arrRemove = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    test.strictEqual(EntryPool.removeEntry(arr, 2), false);
    test.strictEqual(EntryPool.removeEntry(arr, 1), true);
    test.strictEqual(EntryPool.numEntries(arr), 0);
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
    test.strictEqual(arr[0], 2);
    test.strictEqual(arr[1], 3);
    test.strictEqual(arr[2], undefined);
    test.done();
};

exports.arrAddOverLimit = function(test) {
    var pool = new EntryPool(1, 1),
        arr = pool.get();
    EntryPool.addEntry(arr, 1);
    test.strictEqual(EntryPool.addEntry(arr, 2), -1);
    test.strictEqual(arr[0], 1);
    test.strictEqual(arr[1], undefined);
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
    test.strictEqual(arr[0], 3);
    test.strictEqual(arr[1], undefined);
    test.strictEqual(arr[2], undefined);
    test.strictEqual(EntryPool.cleanupEntries(arr, 4), 0);
    test.strictEqual(arr[0], undefined);
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