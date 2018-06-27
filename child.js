const { FSWatcher } = require('chokidar');
const optionsTransfer = require('./options');

let watcher;

function sendEvent(event, path) {
  process.send({
    event: event,
    path: path
  });
}

function init(options) {
  options = optionsTransfer.decode(options);
  watcher = new FSWatcher(options);
  watcher.on('all', (event, path) => {
    sendEvent(event, path);
  });
  sendEvent('ready');
}

function executeFunction(functionName, args) {
  try {
    watcher[functionName](...args);
  } catch (e) {
    // Do nothing
  }
}

process.on('message', (msg) => {
  switch (msg.type)  {
    case 'init':
      init(msg.options);
      break;
    case 'function':
      executeFunction(msg.name, msg.args);
      break;
    case 'die':
      process.exit();
      break;
  }
});

process.on('error', e => {
  // Do nothing
});

process.on('disconnect', () => {
  process.exit();
});