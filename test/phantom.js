JSCLASS_PATH = '../build/src'
require(JSCLASS_PATH + '/loader')
JS.require('JS.Test')

var page     = new WebPage(),
    reporter = new JS.Test.Reporters.PhantomJS({}, page)

page.open('test/browser.html')

