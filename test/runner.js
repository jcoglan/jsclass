JSCLASS_PATH = 'build/src/';
load(JSCLASS_PATH + 'loader.js');

JS.Packages(function() { with(this) {
    autoload(/^(.*)Spec$/, {from: 'test/specs', require: 'JS.$1'});
}});

require('JS.Test', function() {
    require('ModuleSpec',
            'SetSpec',
            
    JS.Test.method('autorun'))
});

