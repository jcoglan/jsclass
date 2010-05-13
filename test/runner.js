if (!this.load) load = function(path) {
  var fso = new ActiveXObject('Scripting.FileSystemObject'), file, runner;
  try {
    file   = fso.OpenTextFile(path);
    runner = function() { eval(file.ReadAll()) };
    runner();
  } finally {
    try { if (file) file.Close() } catch (e) {}
  }
};

JSCLASS_PATH = 'build/min/'
load(JSCLASS_PATH + 'loader.js')

JS.Packages(function() { with(this) {
    autoload(/^(.*)Spec$/, {from: 'test/specs', require: 'JS.$1'})
    
    pkg('Test.UnitSpec').requires('JS.Set', 'JS.Observable', 'JS.Range')
}})

require('JS.Test', 'JS.MethodChain', function() {
    require('Test.UnitSpec',
            'Test.ContextSpec',
            'ComparableSpec',
            'EnumerableSpec',
            'HashSpec',
            'ObservableSpec',
            'SetSpec',
            'RangeSpec',
            
    JS.Test.method('autorun'))
})

