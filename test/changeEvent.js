const FSWatcher = require('../index');
const fs = require('fs-extra');
const path = require('path');
const assert = require('assert');

describe('change event', function() {
  let tmpFolder = path.join(__dirname, './tmp/');

  before(() => {
    fs.mkdirp(tmpFolder);
  });

  it('Should emit event on filechange', async () => {
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
    await new Promise(resolve => setTimeout(resolve, 250));
    await fs.writeFile(filepath, 'this is not a text document');
    await new Promise(resolve => setTimeout(resolve, 500));

    assert(changed, 'File should be flagged as changed.');

    watcher.close();
  });

  it('Should emit event on filechange using arrays', async () => {
    let watcher = new FSWatcher({});

    let filepath = path.join(tmpFolder, 'file1.txt');
    await fs.writeFile(filepath, 'this is a text document');
    watcher.add([filepath]);
    let changed = false;
    watcher.once('change', () => {
      changed = true;
    });
    if (!watcher.ready) {
      await new Promise(resolve => watcher.once('ready', resolve));
    }
    await new Promise(resolve => setTimeout(resolve, 250));
    await fs.writeFile(filepath, 'this is not a text document');
    await new Promise(resolve => setTimeout(resolve, 500));

    assert(changed, 'File should be flagged as changed.');

    watcher.close();
  });

  it('Should not emit event if file has been added and removed', async () => {
    let watcher = new FSWatcher({});

    let filepath = path.join(tmpFolder, 'file1.txt');
    await fs.writeFile(filepath, 'this is a text document');
    await new Promise(resolve => setTimeout(resolve, 250));
    watcher.add(filepath);
    let changed = false;
    watcher.once('change', () => {
      changed = true;
    });
    if (!watcher.ready) {
      await new Promise(resolve => watcher.once('ready', resolve));
    }
    await new Promise(resolve => setTimeout(resolve, 250));
    watcher.unwatch(filepath);
    await fs.writeFile(filepath, 'this is not a text document');
    await new Promise(resolve => setTimeout(resolve, 500));

    assert(!changed, 'Should not have emitted a change event.');

    watcher.close();
  });
});