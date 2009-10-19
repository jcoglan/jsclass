JSCLASS_PATH = 'build/min/'
load(JSCLASS_PATH + 'loader.js')

JS.Packages(function() { with(this) {
    autoload(/^(.*)Spec$/, {from: 'test/specs', require: 'JS.$1'})
    
    pkg('TestSpec').requires('JS.Set', 'JS.Observable', 'JS.Range')
}})

require('JS.Test', function() {
    require('TestSpec',
            
    JS.Test.method('autorun'))
})

