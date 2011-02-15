(function() {
  var $ = (typeof this.global === 'object') ? this.global : this
  $.JSCLASS_PATH = 'build/min/'
})()

if (typeof require === 'function') {
  require('../' + JSCLASS_PATH + 'loader')
} else {
  load(JSCLASS_PATH + 'loader.js')
}

JS.require('JS.Hash', function() {
  var hash = new JS.OrderedHash(['foo', 4, 'bar', 5])
  
  JS.Method.tracing(JS.Hash, function() {
    hash.hasKey('foo')
    JS.Console.puts()
    hash.select(function() { throw new Error('fail') })
  })
  
  hash.hasKey('something')
})
