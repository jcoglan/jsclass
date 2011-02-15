(function() {
  var $ = (typeof this.global === 'object') ? this.global : this
  $.JSCLASS_PATH = 'build/min/'
})()

if (typeof require === 'function') {
  require('../' + JSCLASS_PATH + 'loader')
} else {
  load(JSCLASS_PATH + 'loader.js')
}

Foo = {}

JS.require('JS.Hash', 'JS.TSort', function() {
  Tasks = new JS.Class({
    include: JS.TSort,
    
    initialize: function(table) {
      this.table = table;
    },
    
    tsortEachNode: function(block, context) {
      for (var task in this.table) {
        if (this.table.hasOwnProperty(task))
        block.call(context, task);
      }
    },
    
    tsortEachChild: function(task, block, context) {
      var tasks = this.table[task];
      for (var i = 0, n = tasks.length; i < n; i++)
      block.call(context, tasks[i]);
    }
  })
  
  var tasks = new Tasks({
    'eat breakfast': ['serve'],
    'serve':         ['cook'],
    'cook':          ['buy bacon', 'buy eggs'],
    'buy bacon':     [],
    'buy eggs':      []
  })

  var hash = new JS.OrderedHash(['foo', 4, 'bar', 5])
  
  JS.Method.tracing([JS.Hash, JS.TSort], function() {
    tasks.tsort()
    hash.hasKey('foo')
    JS.Console.puts(JS.Console.nameOf(Foo))
    hash.select(function() { throw new Error('fail') })
  })
  
  hash.hasKey('something')
})
