JS.ENV.CWD = (typeof CWD === 'undefined') ? '.' : CWD

JS.Packages(function() { with(this) {
    autoload(/^(.*)Spec$/, {from: CWD + '/test/specs', require: 'JS.$1'})
    
    pkg('Test.UnitSpec').requires('JS.Set', 'JS.Observable', 'JS.Range')
    pkg('ClassSpec').requires('ModuleSpec')
    
    file(CWD + '/test/specs/test/test_spec_helpers.js').provides('TestSpecHelpers')
    
    pkg('Test.UnitSpec').requires('TestSpecHelpers')
    pkg('Test.MockingSpec').requires('TestSpecHelpers')
}})

JS.require('JS.Test', 'JS.MethodChain', function(Test, MC) {
    JS.require( 'Test.UnitSpec',
                'Test.ContextSpec',
                'Test.MockingSpec',
                'Test.FakeClockSpec',
                'Test.AsyncStepsSpec',
                'ModuleSpec',
                'ClassSpec',
                'KernelSpec',
                'SingletonSpec',
                'InterfaceSpec',
                'CommandSpec',
                'ComparableSpec',
                'ConstantScopeSpec',
                'DecoratorSpec',
                'EnumerableSpec',
                'ForwardableSpec',
                'HashSpec',
                'LinkedListSpec',
                'MethodChainSpec',
                'DeferrableSpec',
                'ObservableSpec',
                'PackageSpec',
                'ProxySpec',
                'RangeSpec',
                'SetSpec',
                'StateSpec',
                'TSortSpec',
            
    Test.method('autorun'))
})
