const FSWatcher = require('../src/index');
const fs = require('fs-extra');
const path = require('path');
const assert = require('assert');
const {sleep} = require('./utils');

describe('error handling', function() {
  let tmpFolder = path.join(__dirname, './tmp/');

  before(() => {
    fs.mkdirp(tmpFolder);
  });

  it('Should restart child process if it dies', async () => {
    let watcher = new FSWatcher({});

    let filepath = path.join(tmpFolder, 'file1.txt');

    await fs.writeFile(filepath, 'this is a text document');

    watcher.add(filepath);

    let changed = false;
    watcher.once('change', () => {
      changed = true;
    });

    watcher.on('watcherError', e => {
      console.log(e);
    });

    if (!watcher.ready) {
      await new Promise(resolve => watcher.once('ready', resolve));
    }

    await sleep(250);

    watcher._emulateChildDead();

    await sleep(1000);
    
    await fs.writeFile(filepath, 'this is not a text document');

    await sleep(500);

    assert(changed, 'Should have emitted a change event.');

    await watcher.close();
  });

  it('Should restart child process on errors', async () => {
    let watcher = new FSWatcher({});

    let filepath = path.join(tmpFolder, 'file1.txt');

    await fs.writeFile(filepath, 'this is a text document');

    watcher.add(filepath);

    let changed = false;
    watcher.once('change', () => {
      changed = true;
    });

    if (!watcher.ready) {
      await new Promise(resolve => watcher.once('ready', resolve));
    }

    await sleep(250);

    watcher._emulateChildError();

    await sleep(1000);

    await fs.writeFile(filepath, 'this is not a text document');

    await sleep(500);

    assert(changed, 'Should have emitted a change event.');

    await watcher.close();
  });
});