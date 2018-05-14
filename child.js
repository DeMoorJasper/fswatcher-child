const { FSWatcher } = require('chokidar');

let watcher;

function sendEvent(event, path) {
  console.log('EVENT: ', event);
  process.send({
    event: event,
    path: path
  });
}

function init(options) {
  watcher = new FSWatcher(options);
  watcher.on('all', (event, path) => {
    sendEvent(event, path);
  });
  sendEvent('ready');
}

function executeFunction(functionName, args) {
  watcher[functionName](...args);
}

process.on('message', (msg) => {
  switch(msg.type) {
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

process.on('error', () => {
  // Do nothing
});

process.on('disconnect', () => {
  process.exit();
});