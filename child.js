'use strict'

var watch = require('chokidar').watch

process.once('message', function (msg) {
  var watcher = watch(msg.path, msg.opts)

  watcher.on('all', function (event, path) {
    process.send({ event: event, path: path })
  })
})

process.on('error', function () {})

process.on('disconnect', function () {
  process.exit()
})
