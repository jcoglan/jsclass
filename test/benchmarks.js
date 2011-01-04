(function() {
  var $ = (typeof this.global === 'object') ? this.global : this
  $.JSCLASS_PATH = 'build/min/'
})()

if (typeof require === 'function')
  require('../' + JSCLASS_PATH + 'loader')
else
  load(JSCLASS_PATH + 'loader.js')


JS.require('JS.Benchmark', function() {
  var bm = JS.Benchmark
  
  bm.measure('Class creation', 300, {
    test: function() {
      new JS.Class({
        method1: function() {},
        method1: function() {},
        method1: function() {}
      })
    }
  })
  
  bm.measure('Module#ancestors', 5000, {
    setup: function() {
      var included = new JS.Module({ include: new JS.Module({ include: new JS.Module() }) })
      this.module = new JS.Module()
      this.module.include(included)
    },
    test: function() {
      this.module.ancestors()
    }
  })
  
  bm.measure('Module#ancestors (cached)', 5000, {
    setup: function() {
      var included = new JS.Module({ include: new JS.Module({ include: new JS.Module() }) })
      this.module = new JS.Module()
      this.module.include(included)
      this.module.ancestors()
    },
    test: function() {
      this.module.ancestors()
    }
  })
})

