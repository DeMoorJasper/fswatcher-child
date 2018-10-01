const FSWatcher = require('../src/index');
const {sleep} = require('./utils');
const assert = require('assert');

describe('Watcher', function() {
  it('Should be able to create a new watcher', async () => {
    let watcher = new FSWatcher();

    assert(!!watcher.child);
    assert(!watcher.ready);

    await sleep(1000);

    assert(!!watcher.child);
    assert(watcher.ready);

    await watcher.close();
  });

  it('Should be able to properly destroy the watcher', async () => {
    let watcher = new FSWatcher();

    await sleep(1000);

    assert(!!watcher.child);
    assert(watcher.ready);

    let time = Date.now();
    await watcher.close();
    assert.notEqual(time, Date.now());
  });
});
