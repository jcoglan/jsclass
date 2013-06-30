JS.ENV.CWD = (typeof CWD === 'undefined') ? '.' : CWD

JS.cache = false
if (JS.ENV.JS_DEBUG) JS.debug = true

JS.packages(function() { with(this) {
  autoload(/^(.*)Spec$/, {from: CWD + '/test/specs', require: ['JS.$1']})

  pkg('Test.UnitSpec').requires('JS.Set', 'JS.Observable')
  pkg('ClassSpec').requires('ModuleSpec')

  file(CWD + '/test/specs/test/test_spec_helpers.js').provides('TestSpecHelpers')

  pkg('Test.UnitSpec').requires('TestSpecHelpers')
  pkg('Test.MockingSpec').requires('TestSpecHelpers')
}})

JS.require('JS', 'JS.Test', function(js, Test) {
  js.extend(JS, js)
  JS.Test = Test

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

  specs = Test.filter(specs, 'Spec')
  specs.push(function() { Test.autorun() })
  JS.require.apply(JS, specs)
})

