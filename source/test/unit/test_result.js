JS.Test.Unit.extend({
  TestResult: new JS.Class({
    include: JS.Test.Unit.Util.Observable,
    
    extend: {
      CHANGED:  'CHANGED',
      FAULT:    'FAULT'
    },
    
    initialize: function() {
      this._runCount = this._assertionCount = 0;
      this._failures = [];
      this._errors   = [];
    },
    
    addRun: function() {
      this._runCount += 1;
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    addFailure: function(failure) {
      this._failures.push(failure);
      this.notifyListeners(this.klass.FAULT, failure);
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    addError: function(error) {
      this._errors.push(error);
      this.notifyListeners(this.klass.FAULT, error);
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    addAssertion: function() {
      this._assertionCount += 1;
      this.notifyListeners(this.klass.CHANGED, this);
    },
    
    toString: function() {
      return this.runCount() + ' tests, ' + this.assertionCount() + ' assertions, ' +
             this.failureCount() + ' failures, ' + this.errorCount() + ' errors';
    },
    
    passed: function() {
      return this._failures.length === 0 && this._errors.length === 0;
    },
    
    runCount: function() {
      return this._runCount;
    },
    
    assertionCount: function() {
      return this._assertionCount;
    },
    
    failureCount: function() {
      return this._failures.length;
    },
    
    errorCount: function() {
      return this._errors.length;
    }
  })
});

