JSCLASS_PATH = '../build/src'
var pkg = require(JSCLASS_PATH + '/loader')

pkg.require('JS.Test', function(Test) {
  var reporter = new Test.Reporters.Headless()
  reporter.open('test/browser.html')
})

