PKG = (typeof PKG === 'object') ? PKG : JS
PKG.ENV.CWD = (typeof CWD === 'undefined') ? '.' : CWD

PKG.cacheBust = true
if (PKG.ENV.JS_DEBUG) PKG.debug = true

PKG.packages(function() { with(this) {
  autoload(/^(.*)Spec$/, {from: CWD + '/test/specs', require: 'JS.$1'})

  pkg('EnumerableSpec').requires('JS.Enumerator', 'JS.Hash', 'JS.Range')
  pkg('Test.UnitSpec').requires('JS.Set', 'JS.Observable')
  pkg('ClassSpec').requires('ModuleSpec')

  file(CWD + '/test/specs/test/test_spec_helpers.js').provides('TestSpecHelpers')

  pkg('Test.UnitSpec').requires('TestSpecHelpers')
  pkg('Test.MockingSpec').requires('TestSpecHelpers')
}})

PKG.require('JS', 'JS.Test', function(JS, Test) {
  PKG.ENV.JS = JS
  JS.Package = PKG.Package
  JS.Test    = Test

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
                'EnumeratorSpec',
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
  PKG.require.apply(PKG, specs)
})

