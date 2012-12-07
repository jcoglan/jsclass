JS.ENV.CWD = (typeof CWD === 'undefined') ? '.' : CWD

JS.cacheBust = true

JS.Packages(function() { with(this) {
    autoload(/^(.*)Spec$/, {from: CWD + '/test/specs', require: 'JS.$1'})
    
    pkg('Test.UnitSpec').requires('JS.Set', 'JS.Observable', 'JS.Range')
    pkg('ClassSpec').requires('ModuleSpec')
    pkg('EnumerableSpec').requires('JS.Range')
    pkg('SetSpec').requires('JS.Range')
    
    file(CWD + '/test/specs/test/test_spec_helpers.js').provides('TestSpecHelpers')
    
    pkg('Test.UnitSpec').requires('TestSpecHelpers')
    pkg('Test.MockingSpec').requires('TestSpecHelpers')
}})

JS.require('JS.Test', 'JS.MethodChain', function(Test, MC) {
    var specs = [ 'Test.UnitSpec',
                  'Test.ContextSpec',
                  'Test.MockingSpec',
                  'Test.FakeClockSpec',
                  'Test.AsyncStepsSpec',
                  'ModuleSpec',
                  'ClassSpec',
                  'MethodSpec',
                  'KernelSpec',
                  'SingletonSpec',
                  'InterfaceSpec',
                  'CommandSpec',
                  'ComparableSpec',
                  'ConsoleSpec',
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
                  'TSortSpec' ]
    
    specs = JS.Test.filter(specs, 'Spec')
    specs.push(Test.method('autorun'))
    JS.require.apply(JS, specs)
})

