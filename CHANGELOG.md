### 4.0.5 / 2014-03-19

* Rename `MethodChain#_()` to `MethodChain#__()` to avoid clobbering Underscore
  in test suites

### 4.0.4 / 2013-12-01

* Remove `Enumerable` class methods from `Test.Unit.TestCase`
* Log all mock argument matchers that match a method call, so a test will not
  fail if two mocks match the same call
* Use the last matching stub expression to pick the function's response rather
  than the first since the last will usually be more specific

### 4.0.3 / 2013-11-07

* Don't treat `null` as an error when passed to async test callbacks
* Be strict about whether stubbed functions are called with `new` or not
* Add `withNew()` as a stub modifier to replace `stub('new', ...)`
* Add `on(target)` as a stub matcher for checking the `this` binding of a call
* Improve stub error messaging and argument matcher representations

### 4.0.2 / 2013-07-06

* Change `AsyncSteps` so it wraps all calls to `before()`, `it()` and `after()`
  so that each block waits for all the steps it queues to complete

### 4.0.1 / 2013-07-01

* Fix indexing bug in dynamic generation of autoload.require lists

### 4.0.0 / 2013-06-30

* Turn all library components into CommonJS modules running in strict mode
* Extract `JS.Test` into its own package, `jstest`, with expanded platform
  support
* Extract `jsbuild` into its own package
* Remove `callSuper` from objects when there is no super method to dispatch to
* Remove the `Benchmark` module, we recommend
  [Benchmark.js](http://benchmarkjs.com/) instead
* Refactor `Console` to make it easier to replace platform implementations
* Add cursor movement, `exit()` and `envvar()` APIs to `Console`
* Allow color output to be disabled using the `NO_COLOR=1` environment variable
* Support color console output in Chrome and PhantomJS
* Remote the `it()` and `its()` global functions from `MethodChain`
* Rename `JS.Packages` to `JS.packages` (lowercase `p`) and replace
  `JS.cacheBust = true` with `JS.cache = false`
* Allow package autoloaders to supply their own function for converting an
  object name into a path
* Make sure that errors are correctly propagated and handled in async tests
* Allow errors added to `Test.ASSERTION_ERRORS` to be treated as failures
* Add pluggable test reporter API with many new built-in output formats and
  adapters for many browser test runners

### 3.0.9 / 2012-08-09

* Correct the name of `--directory` param to `jsbuild`

### 3.0.8 / 2012-08-04

* Ship source maps for minified JavaScript files
* Fix a bug in stubbing library that makes it easier to stub methods on
  prototypes
* Catch uncaught errors on Node and in the browser, so errors that happen in
  async code don't crash the test process
* Make `assertEqual()` work with `Date()` objects

### 3.0.7 / 2012-02-22

* Fix a race condition in the `AsyncSteps` scheduling code
* Make `Console` stringify DOM nodes successfully in Chrome

### 3.0.6 / 2012-02-20

* Allow packages to contain multiple files as a convenience for loading
  3rd-party libraries
* Fix script loading on Adobe AIR
* Fix fetching of scripts over HTTPS in `jsbuild`, and fail if requests return a
  non-200 status
* Make sure `Module` and `Method` have all the `Kernel` methods
* Make tests raise an error if a block takes a resume-callback but doesn't call
  it after 10 seconds
* Change `TestSuite.forEach` so that test suites run much faster
* Show stack traces for errors during tests, and use `sourceURL` mapping to
  improve reporting of errors from scripts loaded over XHR

### 3.0.5 / 2011-12-06

* Allow `yields()` and `returns()` to be used on the same stub
* Remove deprecation warnings about Node's `sys` module

### 3.0.4 / 2011-08-18

* Add `JS.load()` function as shorthand method for loading files, and
  `JS.cacheBust` setting for bypassing the browser cache
* Make `jsbuild` error output nicer, e.g. don't show Node backtrace

### 3.0.3 / 2011-08-15

* Allow constructors expected to be called with `new` to be mocked and stubbed
  in `Test`
* Enhance browser UI with user agent and success indicator and provide controls
  for running individual groups of tests
* Send entire test UI snapshot to TestSwarm rather than just a short status
  summary
* Fix serialization of objects containing circular references in
  `Console.convert()`
* Improvements to `jsbuild` for managing bundles of scripts

### 3.0.2 / 2011-07-16

* Exit with non-zero exit status from `Test.autorun()` if there  are any test
  failures
* Log test progress as JSON so we can pick up test results using
  [PhantomJS](http://www.phantomjs.org)
* Allow post-test reports to cause the build to fail by returning false from
  `report()`. e.g. `Coverage` can cause a red build if it finds methods that
  were not called
* Use synchronous `console.warn()` to produce output in Node, and
  `System.out.print[ln]` on Rhino platforms

### 3.0.1 / 2011-06-17

* Adds NPM package and jsbuild command-line program for bundling required
  modules for deployment, called
  [jsbuild](http://jsclass.jcoglan.com/packages/bundling.html)
* When using `JS.require()`, scripts from the same domain are prefetched over
  XHR to maximize parallel downloading
* Fixes support for negative mock expectations, e.g.
  `expect(object, 'm').exactly(0)`
* Fixes scheduling bugs in `FakeClock` so that current time remains correct when
  removing and restoring timers
* Avoids stubbing of `setTimeout()` inside `AsyncSteps`, otherwise it becomes
  very hard to use with `FakeClock`

### 3.0.0 / 2011-02-28

* All components now run on a much wider array of
  [platforms](http://jsclass.jcoglan.com/platforms.html)
* JS.Class is now tested using its own test framework,
  [JS.Test](http://jsclass.jcoglan.com/testing.html)
* New libraries: `Benchmark`, `Console`, `Deferrable`, `OrderedHash`, `Range`,
  `OrderedSet`, `TSort`
* `HashSet` has become the base `Set` implementation, and the original `Set`
  implementation has been removed
* `StackTrace` has been totally overhauled to support extensible user-defined
  tracing functionality
* New core method `Module#alias()` for aliasing methods
* User-defined keyword methods using `Method.keyword()`
* JS.Class no longer supports subclassing the `Class` class
* `Module#instanceMethod()` returns a `Method`, not a `Function`
* `Enumerable#grep()` now supports selecting by type, e.g. `items.grep(Array)`.
  It does not support functional predicates like
  `items.grep(function(x) { return x == 0 })`, you should use
  `Enumerable#select()` for this
* Objects with the same properties, and Arrays with the same elements are now
  considered equal when used as `Hash` keys
* `MethodChain#fire()` is now called `MethodChain#__exec__()`
* `JS.Ruby` has been removed
* `JS.State` now adds `states()` as a class method, rather than a macro in the
  class body. All classes using 'inline' states MUST call this method to declare
  and resolve their states

### 2.1.5 / 2010-06-05

* Adds support for Node, Narwhal and Windows Script Host to the `JS.Package`
  loading system
* Adds an `autoload` macro to the package system for quickly configuring modules
  using filename conventions
* Renames `require()` to `JS.require()` so as not to conflict with CommonJS
  module API

### 2.1.4 / 2010-03-09

* Rewritten the package loader to use event listeners to trigger loading of
  dependencies rather than polling for readiness
* `package.js` and `loader.js` no longer depend on or include the JS.Class core;
  you must call `require()` to use `JS.Class`, `JS.Module`, `JS.Interface` or
  `JS.Singleton`
* Fix bug in browser package loader in environments that have a global `console`
  object with no `info()` method

### 2.1.3 / 2009-10-10

* Fixes the `load()` function in the `Packages` DSL, and adds some caching to
  improve lookup times for finding a package by the name of its provided objects
* Non-existent package errors are now defered until you `require()` an object
  rather than being thrown at package definition time. This means `require()`
  won't complain about being passed native objects or objects loaded by other
  means, as long as the required object does actually exist
* `MethodChain` now adds instance methods from `Modules`, and adds methods that
  were defined *before* `MethodChain` was loaded
* `State` now supports `callSuper()` to state methods imported from mixins;
  previously you could only `callSuper()` to the superclass

### 2.1.2 / 2009-08-11

* `LinkedList` was defined twice in the `stdlib.js` bundle; this is now fixed
  (thanks @skim)

### 2.1.1 / 2009-07-06

* Fixes a couple of `Set` bugs: `Set#isProperSuperset` had a missing argument,
  and incomparable objects were being allowed into `SortedSet` collections

### 2.1.0 / 2009-06-08

* New libraries: `ConstantScope`, `Hash`, `HashSet`
* Improved package manager, supports parallel downloads in web browsers and now
  also works on server-side platforms (tested on SpiderMonkey, Rhino and V8).
  Also supports custom loader functions for integration with Google, YUI etc
* `Enumerable` updated with Ruby 1.9 methods, enumerators, and `Symbol#to_proc`
  functionality when passing strings to iterators. Any object with a
  `toFunction()` method can be used as an iterator. Search methods now use
  `equals()` where possible
* `ObjectMethods` module is now called `Kernel`
* New `Kernel` methods: `tap()`, `equals()`, `hash()`, `enumFor()` and
  `methods()`, and new `Module` methods: `instanceMethods()` and `match()`
* The [double inclusion
  problem](http://eigenclass.org/hiki/The+double+inclusion+problem) is now
  fixed, i.e. the following works in JS.Class 2.1:

```js
A = new JS.Module();
C = new JS.Class({ include: A });
B = new JS.Module({ foo: function() { return 'B#foo' } });
A.include(B);
D = new JS.Class({ include: A });

new C().foo()   // -> 'B#foo'
new D().foo()   // -> 'B#foo'
```

* Ancestor and method lookups are cached for improved performance
* Automatic generation of `displayName` on methods for integration with the
  WebKit debugger
* API change: `Set#classify` now returns a `Hash`, not an `Object`
* PDoc documentation for the core classes

### 1.6.3 / 2009-03-04

* Fixes a bug caused by `Function#prototype` becoming a non-enumerable property
  in Safari 4, causing classes to inherit from themselves and leading to stack
  overflows

### 2.0.2 / 2008-10-01

* The function returned by `object.method('callSuper')` now behaves correctly
  when called after the containing method has returned

### 1.6.2 / 2008-10-01

* Fixes some bugs to make various `forEach()` methods more robust

### 2.0.1 / 2008-09-14

* Fixes a `super()`-related bug in `Command`
* Better handling of `include` and `extend` directives such that these are
  processed before all the other methods are added. This allows mixins to
  override parts of the including class to affect future method definitions
* `Module#include()` has been fixed so that overriding it produces more sane
  behaviour with respect to classes that delegate to a module behind the scenes
  to store methods

### 2.0.0 / 2008-08-12

* Complete rewrite of the core, including a proper implementation of `Module`
  with all inheritance semantics based around this. Ruby-style multiple
  inheritance now works correctly, and `callSuper()` can call methods from
  mixins
* `Class` and `Module` are now classes, and must be created using the `new`
  keyword
* Some [backward compatibility breaks](http://jsclass.jcoglan.com/upgrade.html)
* New method: `Object#__eigen__()` returns an object's metaclass
* Performance of `super()` calls is much improved
* New libraries: `Package`, `Set`, `SortedSet` and `StackTrace`
* `Package` provides a dependency-aware system for loading new JavaScript files
  on demand

### 1.6.1 / 2008-04-17

* Fixes bug in `Decorator` and `Proxy.Virtual` caused by the `klass` property
  being treated as a method and delegated

### 1.6.0 / 2008-04-10

* Adds a DSL for defining classes in a more Ruby-like way using procedures
  rather than declarations (experimental)
* New libraries: `Forwardable`, `State`
* The `extended()` hook is now supported
* The `implement` directive is no longer supported

### 1.5.0 / 2008-02-25

* Adds a standard library, including `Command`, `Comparable`, `Decorator`,
  `Enumerable`, `LinkedList`, `MethodChain`, `Observable` and `Proxy.Virtual`
* Renames `_super()` to `callSuper()` to avoid problems with PackR's private
  variable shrinking
* Adds an `Object#wait()` method that calls a `MethodChain` on the object using
  `setTimeout()`

### 1.0.1 / 2008-01-14

* Memoizes calls to `Object#method()` so that the same function object is
  returned each time

### 1.0.0 / 2008-01-04

* Singleton methods that call `super()` are now supported
* `Object#is_a()` has been renamed to `Object#isA()`
* Classes now support `inherited()` and `included()` hooks
* Adds `Interface` class for easier duck-typing checks across several methods
* New directive `implement` can be used to check that a class implements some
  interfaces
* Singletons are now supported as class-like definitions that yield a single
  object
* `Module` has been added as a way to protect sets of methods by wrapping them
  in a closure
* Removes the `bindMethods` class flag in favour of the more efficient and
  Ruby-like `Ojbect#method()`. This can also be used on classes to get bound
  class methods
* Exceptions thrown while calling super are no longer swallowed inside the
  framework
* `Class#method()` is now `Class#instanceMethod`

### 0.9.2 / 2007-11-13

* Fixes bug caused by multiple methods in the same call stack clobbering
  `_super()`
* Fixes some inheritance bugs related to class methods and built-in instance
  methods
* Improves performance by bootstrapping JavaScript's prototypes for instance
  method inheritance
* Allows inheritance from non-JS.Class-based classes

### 0.9.1 / 2007-11-12

* Improves performance by checking whether methods use `_super()` and only
  wrapping where necessary

### 0.9.0 / 2007-11-11

* Initial release. Features single inheritance and `_super()`

