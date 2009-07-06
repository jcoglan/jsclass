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
    
    extend: {
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
    },
    
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
      this.toString = this.name;
    },
    
    /**
     * JS.Test.Unit.TestCase#run(result) -> undefined
     * 
     * Runs the individual test method represented by this
     * instance of the fixture, collecting statistics, failures
     * and errors in `result`.
     **/
    run: function(result, block, context) {
      block.call(context || null, this.klass.STARTED, this.name());
      this._result = result;
      try {
        this.setup();
        this[this._methodName]();
      } catch (e) {
        if (JS.isType(e, JS.Test.Unit.AssertionFailedError))
          this.addFailure(e.message);
        else
          this.addError(e);
      } finally {
        try {
          this.teardown();
        } catch (e) {
          if (JS.isType(e, JS.Test.Unit.AssertionFailedError))
            this.addFailure(e.message);
          else
            this.addError(e);
        }
      }
      result.addRun();
      block.call(context || null, this.klass.FINISHED, this.name());
    },
    
    /**
     * JS.Test.Unit.TestCase#setup() -> undefined
     * 
     * Called before every test method runs. Can be used
     * to set up fixture information.
     **/
    setup: function() {},
    
    /**
     * JS.Test.Unit.TestCase#teardown() -> undefined
     * 
     * Called after every test method runs. Can be used to tear
     * down fixture information.
     **/
    teardown: function() {},
    
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
    }
  })
});

