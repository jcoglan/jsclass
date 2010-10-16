if (this.ActiveXObject) load = function(path) {
  var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
  try {
    file   = fso.OpenTextFile(path);
    runner = function() { eval(file.ReadAll()) }
    runner()
  } finally {
    try { if (file) file.Close() } catch (e) {}
  }
};

JSCLASS_PATH = 'build/min/'

if (typeof require === 'function') {
  require('../../' + JSCLASS_PATH + 'loader')
  require('./benchmark')
} else {
  load(JSCLASS_PATH + 'loader.js')
  load('test/benchmarks/benchmark.js')
}

JS.require('JS.Class', function() {
  Benchmark.measure('Class creation', 100, {
    test: function() {
      new JS.Class({
        method1: function() {},
        method1: function() {},
        method1: function() {}
      })
    }
  })
  
  Benchmark.measure('Module#ancestors', 1000, {
    setup: function() {
      var included = new JS.Module({ include: new JS.Module({ include: new JS.Module() }) })
      this.module = new JS.Module()
      this.module.include(included)
    },
    test: function() {
      this.module.ancestors()
    }
  })
  
  Benchmark.measure('Module#ancestors (cached)', 1000, {
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

