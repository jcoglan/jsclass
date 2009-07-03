/** section: test
 * class JS.Test.Unit.TestResult
 * Collects `JS.Test.Unit.Failure` and `JS.Test.Unit.Error` so that
 * they can be displayed to the user. To this end, observers
 * can be added to it, allowing the dynamic updating of, say, a
 * UI.
 **/
JS.Test.Unit.extend({
  TestResult: new JS.Class({
    // TODO include Util::Observable
    
    extend: {
      CHANGED:  'CHANGED',
      FAULT:    'FAULT'
    },
    
    /**
     * new JS.Test.Unit.TestResult()
     * 
     * Constructs a new, empty TestResult.
     **/
    initialize: function() {
      this.runCount = this.assertionCount = 0;
      this._failures = [];
      this._errors   = [];
      this.toString  = this._toString;
    },
    
    /**
     * JS.Test.Unit.TestResult#addRun() -> undefined
     * 
     * Records a test run.
     **/
    addRun: function() {
      this.runCount += 1;
      // notify_listeners(CHANGED, self)
    },
    
    /**
     * JS.Test.Unit.TestResult#addFailure(failure) -> undefined
     * 
     * Records a `JS.Test.Unit.Failure`.
     **/
    addFailure: function(failure) {
      this._failures.push(failure);
      // notify_listeners(FAULT, failure)
      // notify_listeners(CHANGED, self)
    },
    
    /**
     * JS.Test.Unit.TestResult#addError(error) -> undefined
     * 
     * Records a `JS.Test.Unit.Error`.
     **/
    addError: function(error) {
      this._errors.push(error);
      // notify_listeners(FAULT, error)
      // notify_listeners(CHANGED, self)
    },
    
    /**
     * JS.Test.Unit.TestResult#addAssertion() -> undefined
     * 
     * Records an individual assertion.
     **/
    addAssertion: function() {
      this.assertionCount += 1;
      // notify_listeners(CHANGED, self)
    },
    
    /**
     * JS.Test.Unit.TestResult#toString() -> String
     * 
     * Returns a string contain the recorded runs, assertions,
     * failures and errors in this TestResult.
     **/
    _toString: function() {
      return this.runCount + ' tests, ' + this.assertionCount + ' assertions, ' +
             this.failureCount() + ' failures, ' + this.errorCount() + ' errors';
    },
    
    /**
     * JS.Test.Unit.TestResult#passed() -> Boolean
     * 
     * Returns whether or not this TestResult represents
     * successful completion.
     **/
    passed: function() {
      return this._failures.length === 0 && this._errors.length === 0;
    },
    
    /**
     * JS.Test.Unit.TestResult#failureCount() -> Number
     * 
     * Returns the number of failures this TestResult has
     * recorded.
     **/
    failureCount: function() {
      return this._failures.length;
    },
    
    /**
     * JS.Test.Unit.TestResult#errorCount() -> Number
     * 
     * Returns the number of errors this TestResult has
     * recorded.
     **/
    errorCount: function() {
      return this._errors.length;
    }
  })
});

