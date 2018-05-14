# FSWatcher child

[![Travis CI](https://travis-ci.org/DeMoorJasper/fswatcher-child.svg?branch=master)](https://travis-ci.org/DeMoorJasper/fswatcher-child)

FSWatcher child is a wrapper around chokidar's FSWatcher to provide an error prone layer between your code and chokidar using a child process.

To get a reliable result in testing listen for the `ready` event, as the watcher will not be able to look for file changes during startup times.

## License

MIT
