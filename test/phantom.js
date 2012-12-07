JSCLASS_PATH = '../build/src'
require(JSCLASS_PATH + '/loader')
JS.require('JS.Test')

var page     = new WebPage(),
    reporter = new JS.Test.Reporters.PhantomJS({format: 'spec'}, page)

page.open('test/browser.html')

