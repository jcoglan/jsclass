/** section: test
 * class JS.Test.Unit.TestResult
 * includes JS.Test.Unit.Util.Observable
 * 
 * Collects `JS.Test.Unit.Failure` and `JS.Test.Unit.Error` so that
 * they can be displayed to the user. To this end, observers
 * can be added to it, allowing the dynamic updating of, say, a
 * UI.
 **/
JS.Test.Unit.extend({
  TestResult: new JS.Class({
    include: JS.Test.Unit.Util.Observable,
    
    extend: {
      CHANGED:  'CHANGED',
      FAULT:    'FAULT'
    },
    
    /**
     * new JS.Test.Unit.TestResult()
     * 
     * Constructs a new, empty `JS.Test.Unit.TestResult`.
     **/
    initialize: function() {
      this._runCount = this._assertionCount = 0;
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
      this._runCount += 1;
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#addFailure(failure) -> undefined
     * 
     * Records a `JS.Test.Unit.Failure`.
     **/
    addFailure: function(failure) {
      this._failures.push(failure);
      this.notifyListeners(this.klass.FAULT, failure);
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#addError(error) -> undefined
     * 
     * Records a `JS.Test.Unit.Error`.
     **/
    addError: function(error) {
      this._errors.push(error);
      this.notifyListeners(this.klass.FAULT, error);
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#addAssertion() -> undefined
     * 
     * Records an individual assertion.
     **/
    addAssertion: function() {
      this._assertionCount += 1;
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    /**
     * JS.Test.Unit.TestResult#toString() -> String
     * 
     * Returns a string contain the recorded runs, assertions,
     * failures and errors in this `TestResult`.
     **/
    _toString: function() {
      return this._runCount + ' tests, ' + this._assertionCount + ' assertions, ' +
             this.failureCount() + ' failures, ' + this.errorCount() + ' errors';
    },
    
    /**
     * JS.Test.Unit.TestResult#passed() -> Boolean
     * 
     * Returns whether or not this `TestResult` represents
     * successful completion.
     **/
    passed: function() {
      return this._failures.length === 0 && this._errors.length === 0;
    },
    
    /**
     * JS.Test.Unit.TestResult#failureCount() -> Number
     * 
     * Returns the number of failures this `TestResult` has
     * recorded.
     **/
    failureCount: function() {
      return this._failures.length;
    },
    
    /**
     * JS.Test.Unit.TestResult#errorCount() -> Number
     * 
     * Returns the number of errors this `TestResult` has
     * recorded.
     **/
    errorCount: function() {
      return this._errors.length;
    }
  })
});

