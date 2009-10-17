JSCLASS_PATH = 'build/src/';
load(JSCLASS_PATH + 'loader.js');

JS.Packages(function() { with(this) {
  autoload(/^.*Spec$/, {from: 'test/specs'});
}});

require('JS.Test', function() {
  require('ModuleSpec', JS.Test.method('autorun'))
});

