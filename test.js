'use strict'

var test = require('tape')
var tmp = require('tmp')
var fs = require('fs')
var path = require('path')
var chokidar = require('./')

test('watch for files', function (t) {
  t.plan(2)

  tmp.dir(function (err, dir) {
    t.notOk(err, 'error not expected')

    var watcher = chokidar.watch(dir, {
      ignored: 'afile.js'
    })

    watcher.on('all', function () {
      watcher.close()
      t.pass('event reached')
    })

    fs.writeFile(path.join(dir, 'hello'))
  })
})

test('restart the watcher if it dies', function (t) {
  t.plan(4)

  tmp.dir(function (err, dir) {
    t.notOk(err, 'error not expected')

    var watcher = chokidar.watch(dir, {
      ignored: 'afile.js'
    })

    watcher.on('childDead', function (pid, exit, signal) {
      t.equal(pid, watcher.child.pid, 'pid matches')
      t.equal(exit, null, 'exit code matches')
      t.equal(signal, 'SIGKILL', 'signal matches')
      watcher.close(function () {
        t.pass('watch closed')
      })
    })

    watcher.once('all', function () {
      watcher.child.kill('SIGKILL')
    })
  })
})
