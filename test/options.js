const FSWatcher = require('../index');
const fs = require('fs-extra');
const path = require('path');
const assert = require('assert');

describe('options', function() {
  let tmpFolder = path.join(__dirname, './tmp/');

  before(() => {
    fs.mkdirp(tmpFolder);
  });

  it('Should pass init options with correct ignored regex', async () => {
    let watcher = new FSWatcher({
      ignored: /file/
    });

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

    assert(!changed, 'File should not be flagged as changed.');

    watcher.close();
  });
});