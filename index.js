const fork = require('child_process').fork;
const {EventEmitter} = require('events');
const path = require('path');

class Watcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.options = options;
    this.watchedPaths = new Set();
    this.child = null;

    this.startchild();
  }

  startchild() {
    if (this.child) return;

    this.child = fork(path.join(__dirname, 'child'));

    this.child.send({
      type: 'init',
      options: this.options
    });

    if (this.watchedPaths.size > 0) {
      this.sendCommand('add', [Array.from(this.watchedPaths)]);
    }

    this.child.on('message', msg => this.emit(msg.event, msg.path));

    this.child.on('error', () => {
      // Do nothing
    });

    this.child.on('exit', (exit, signal) => {
      if (!this.closed) {
        // Restart the child
        this.child = null;
        this.startchild();
      }
      this.emit('childDead');
    });
  }

  sendCommand(f, args) {
    this.child.send({
      type: 'function',
      name: f,
      args: args
    });
  }

  _addPath(p) {
    if (!this.watchedPaths.has(p)) {
      this.watchedPaths.add(p);
    }
  }

  add(paths) {
    if (Array.isArray(paths)) {
      for (let p of paths) {
        this._addPath(p);
      }
    } else {
      this._addPath(paths);
    }
    this.sendCommand('add', [paths]);
  }

  unwatch(paths) {
    if (Array.isArray(paths)) {
      for (let p of paths) {
        this.watchedPaths.delete(p);
      }
    } else {
      this.watchedPaths.delete(paths);
    }
    this.sendCommand('unwatch', [paths]);
  }

  getWatched() {
    let watchList = {};
    for (let p of this.watchedPaths) {
      let key = this.options.cwd ? path.relative(this.options.cwd, p) : p;
      // TODO: Implement _items so it's the same as chokidar's output
      watchList[key || '.'] = [];
    }
    return watchList;
  }

  _closePath(p) {
    if (this.watchedPaths.has(p)) {
      this.watchedPaths.delete(p);
    }
    this.sendCommand('_closePath', [p]);
  }

  close() {
    this.closed = true;
    this.child.kill();
  }

  _emulateChildDead() {
    this.child.send({
      type: 'die'
    });
  }
}

module.exports = Watcher;