if (typeof CWD === 'undefined') CWD = '.'

JS.Packages(function() { with(this) {
    autoload(/^(.*)Spec$/, {from: CWD + '/test/specs', require: 'JS.$1'})
    
    pkg('Test.UnitSpec').requires('JS.Set', 'JS.Observable', 'JS.Range')
}})

JS.require('JS.Test', 'JS.MethodChain', function() {
    JS.require('Test.UnitSpec',
            'Test.ContextSpec',
            'ComparableSpec',
            'ConstantScopeSpec',
            'DecoratorSpec',
            'EnumerableSpec',
            'ForwardableSpec',
            'HashSpec',
            'MethodChainSpec',
            'ObservableSpec',
            'ProxySpec',
            'RangeSpec',
            'SetSpec',
            'StateSpec',
            
    JS.Test.method('autorun'))
})

