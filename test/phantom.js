JSCLASS_PATH = '../build/src'
var pkg = require(JSCLASS_PATH + '/loader')

pkg.require('JS.Test', function(Test) {
  var page     = new WebPage(),
      reporter = new Test.Reporters.PhantomJS({}, page)

  page.open('test/browser.html')
})

