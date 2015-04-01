'use strict'

var fork = require('child_process').fork
var EE = require('events').EventEmitter
var inherits = require('util').inherits
var p = require('path')

function nop () {}

function Watcher (path, opts) {
  if (!(this instanceof Watcher)) {
    return new Watcher(path, opts)
  }

  this.path = path
  this.opts = opts

  this._startChild()
}

inherits(Watcher, EE)

Watcher.prototype._startChild = function () {
  var that = this

  if (this.child) {
    return
  }

  this.child = fork(p.join(__dirname, 'child'))

  this.child.send({
    path: this.path,
    opts: this.opts
  })

  this.child.on('message', function (msg) {
    that.emit(msg.event, msg.path)
    that.emit('all', msg.event, msg.path)
  })

  this.child.on('error', nop)

  this.child.on('exit', function (exit, signal) {
    if (that.closing) {
      that.closing = false
      that.closed = true
      return
    }

    that.emit('childDead', that.child.pid, exit, signal)
    that.child = null
    that._startChild()
  })
}

Watcher.prototype.close = function (cb) {
  if (this.child) {
    this.closing = true
    if (cb) {
      this.child.on('exit', cb)
    }

    var that = this
    setImmediate(function () {
      that.child.kill()
    })
  } else if (cb) {
    setImmediate(cb)
  }
}

module.exports.watch = Watcher
