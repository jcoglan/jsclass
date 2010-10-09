if (typeof CWD === 'undefined') CWD = '.'

JS.Packages(function() { with(this) {
    autoload(/^(.*)Spec$/, {from: CWD + '/test/specs', require: 'JS.$1'})
    
    pkg('Test.UnitSpec').requires('JS.Set', 'JS.Observable', 'JS.Range')
    pkg('ClassSpec').requires('ModuleSpec')
}})

JS.require('JS.Test', 'JS.MethodChain', function() {
    JS.require( 'Test.UnitSpec',
                'Test.ContextSpec',
                'ModuleSpec',
                'ClassSpec',
                'KernelSpec',
                'SingletonSpec',
                'InterfaceSpec',
                'CommandSpec',
                'ComparableSpec',
//                'ConstantScopeSpec',
                'DecoratorSpec',
                'EnumerableSpec',
                'ForwardableSpec',
                'HashSpec',
                'MethodChainSpec',
                'ObservableSpec',
                'PackageSpec',
                'ProxySpec',
                'RangeSpec',
                'SetSpec',
//                'StateSpec',
            
    JS.Test.method('autorun'))
})

