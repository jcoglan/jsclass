JSCLASS_PATH = '../build/src'
require(JSCLASS_PATH + '/loader')
JS.require('JS.Test')

var page     = new WebPage(),
    format   = phantom.args[0] || 'dot',
    reporter = new JS.Test.Reporters.PhantomJS({format: format}, page)

page.open('test/browser.html')

