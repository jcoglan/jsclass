var staticHost = 'http://localhost:8000'

exports.tests = {
  rootPath: '..',
  sources:  ['build/min/loader-browser.js'],
  tests:    ['test/runner.js'],
  autoRun:  false,

  resources: ['/build', '/test'].map(function(path) {
    return {path: path, backend: staticHost + path}
  })
}

