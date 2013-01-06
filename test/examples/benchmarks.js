(function() {
  var $ = (typeof this.global === 'object') ? this.global : this
  $.JSCLASS_PATH = 'build/min/'
})()

if (typeof require === 'function')
  var JS = require('../../' + JSCLASS_PATH + 'loader')
else
  load(JSCLASS_PATH + 'loader.js')


JS.require('JS.Module', 'JS.Class', 'JS.Benchmark', 'JS.Set', 'JS.OrderedSet', 'JS.SortedSet',
function(Module, Class, bm, Set, OrderedSet, SortedSet) {

  var sets = [SortedSet, OrderedSet, Set],
      i    = sets.length

  while (i--) {
    bm.measure(sets[i] + ' creation', 10, {
      test: function() {
        var set = new sets[i](), n = 1000
        while (n--) set.add(n)
      }
    })
  }

  bm.measure('Class creation', 300, {
    test: function() {
      new Class({
        method1: function() {},
        method1: function() {},
        method1: function() {}
      })
    }
  })

  bm.measure('Module#ancestors', 5000, {
    setup: function() {
      var included = new Module({ include: new Module({ include: new Module() }) })
      this.module = new Module()
      this.module.include(included)
    },
    test: function() {
      this.module.ancestors()
    }
  })

  bm.measure('Module#ancestors (cached)', 5000, {
    setup: function() {
      var included = new Module({ include: new Module({ include: new Module() }) })
      this.module = new Module()
      this.module.include(included)
      this.module.ancestors()
    },
    test: function() {
      this.module.ancestors()
    }
  })
})

