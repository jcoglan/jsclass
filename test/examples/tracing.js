if (this.ActiveXObject) load = function(path) {
  var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
  try {
    file   = fso.OpenTextFile(path);
    runner = function() { eval(file.ReadAll()) };
    runner();
  } finally {
    try { if (file) file.Close() } catch (e) {}
  }
};

(function() {
  var $ = (typeof this.global === 'object') ? this.global : this
  $.JSCLASS_PATH = 'build/src/'
})()

if (typeof require === 'function') {
  require('../../' + JSCLASS_PATH + 'loader')
} else {
  load(JSCLASS_PATH + 'loader.js')
}

Foo = {}

JS.require('JS.Class', 'JS.Method', 'JS.Console', 'JS.Hash', 'JS.OrderedHash', 'JS.TSort',
function(Class, Method, Console, Hash, OrderedHash, TSort) {
  Tasks = new Class({
    include: TSort,

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

  var hash = new OrderedHash(['foo', 4, 'bar', 5])

  Method.tracing([Hash, TSort], function() {
    tasks.tsort()
    hash.hasKey('foo')
    Console.puts(Console.nameOf(Foo))
    hash.select(function() { throw new Error('fail') })
  })

  hash.hasKey('something')
})

