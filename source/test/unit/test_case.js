JS.Test.Unit.extend({
  /** section: test
   * class JS.Test.Unit.TestCase
   * includes JS.Test.Unit.Assertions
   *
   * Ties everything together. If you subclass and add your own
   * test methods, it takes care of making them into tests and
   * wrapping those tests into a suite. It also does the
   * nitty-gritty of actually running an individual test and
   * collecting its results into a `JS.Test.Unit.TestResult` object.
   **/
  TestCase: new JS.Class({
    include: JS.Test.Unit.Assertions,
    
    extend: [JS.Enumerable, {
      testCases: [],
      
      clear: function() {
        this.testCases = [];
      },
      
      inherited: function(klass) {
        this.testCases.push(klass);
      },
      
      forEach: function(block, context) {
        for (var i = 0, n = this.testCases.length; i < n; i++)
          block.call(context || null, this.testCases[i]);
      },
      
      STARTED:  'Test.Unit.TestCase.STARTED',
      FINISHED: 'Test.Unit.TestCase.FINISHED',
      
      /**
       * JS.Test.Unit.TestCase.suite() -> JS.Test.Unit.TestSuite
       * 
       * Rolls up all of the `test*` methods in the fixture into
       * one suite, creating a new instance of the fixture for
       * each method.
       **/
      suite: function() {
        var methodNames = new JS.Enumerable.Collection(this.instanceMethods()),
            tests = methodNames.select(function(name) { return /^test./.test(name) }).sort(),
            suite = new JS.Test.Unit.TestSuite(this.displayName);
        
        for (var i = 0, n = tests.length; i < n; i++) {
          try { suite.push(new this(tests[i])) } catch (e) {}
        }
        if (suite.empty()) {
          try { suite.push(new this('defaultTest')) } catch (e) {}
        }
        return suite;
      }
    }],
    
    /**
     * new JS.Test.Unit.TestCase(testMethodName)
     * 
     * Creates a new instance of the fixture for running the
     * test represented by `testMethodName`.
     **/
    initialize: function(testMethodName) {
      if (!JS.isFn(this[testMethodName])) throw 'invalid_test';
      this._methodName = testMethodName;
      this._testPassed = true;
    },
    
    /**
     * JS.Test.Unit.TestCase#run(result, continuation, callback, context) -> undefined
     * 
     * Runs the individual test method represented by this
     * instance of the fixture, collecting statistics, failures
     * and errors in `result`.
     **/
    run: function(result, continuation, callback, context) {
      callback.call(context || null, this.klass.STARTED, this);
      this._result = result;
      
      var complete = function() {
        result.addRun();
        callback.call(context || null, this.klass.FINISHED, this);
        continuation();
      };
      
      var teardown = function() {
        this.exec('teardown', complete, this.processError(complete));
      };
      
      this.exec('setup', function() {
        this.exec(this._methodName, teardown, this.processError(teardown));
      }, this.processError(teardown));
    },
    
    exec: function(methodName, onSuccess, onError) {
      if (!methodName) return onSuccess.call(this);
      
      var method = JS.isFn(methodName) ? methodName : this[methodName],
          arity  = (method.arity === undefined) ? method.length : method.arity,
          self   = this;
      
      if (arity === 0)
        return this._runWithExceptionHandlers(function() {
          method.call(this);
          onSuccess.call(this);
        }, onError);
      
      this._runWithExceptionHandlers(function() {
        method.call(this, function(asyncBlock) {
          self.exec(asyncBlock, onSuccess, onError);
        })
      }, onError);
    },
    
    processError: function(doNext) {
      return function(e) {
        if (JS.isType(e, JS.Test.Unit.AssertionFailedError))
          this.addFailure(e.message);
        else
          this.addError(e);
        
        if (doNext) doNext.call(this);
      };
    },
    
    _runWithExceptionHandlers: function(_try, _catch, _finally) {
      try {
        _try.call(this);
      } catch (e) {
        if (_catch) _catch.call(this, e);
      } finally {
        if (_finally) _finally.call(this);
      }
    },
    
    /**
     * JS.Test.Unit.TestCase#setup(resume) -> undefined
     * 
     * Called before every test method runs. Can be used
     * to set up fixture information.
     **/
    setup: function(resume) { resume() },
    
    /**
     * JS.Test.Unit.TestCase#teardown(resume) -> undefined
     * 
     * Called after every test method runs. Can be used to tear
     * down fixture information.
     **/
    teardown: function(resume) { resume() },
    
    defaultTest: function() {
      return this.flunk('No tests were specified');
    },
    
    /**
     * JS.Test.Unit.TestCase#passed() -> Boolean
     * 
     * Returns whether this individual test passed or
     * not. Primarily for use in `JS.Test.Unit.TestCase#teardown`
     * so that artifacts can be left behind if the test fails.
     **/
    passed: function() {
      return this._testPassed;
    },
    
    size: function() {
      return 1;
    },
    
    addAssertion: function() {
      this._result.addAssertion();
    },
    
    addFailure: function(message) {
      this._testPassed = false;
      this._result.addFailure(new JS.Test.Unit.Failure(this.name(), message));
    },
    
    addError: function(exception) {
      this._testPassed = false;
      this._result.addError(new JS.Test.Unit.Error(this.name(), exception));
    },
    
    /**
     * JS.Test.Unit.TestCase#name() -> String
     * 
     * Returns a human-readable name for the specific test that
     * this instance of `JS.Test.Unit.TestCase` represents.
     **/
    name: function() {
      return this._methodName + '(' + this.klass.displayName + ')';
    },
    
    /**
     * JS.Test.Unit.TestCase#toString() -> String
     * 
     * Overridden to return `name`.
     **/
    toString: function() {
      return this.name();
    }
  })
});

