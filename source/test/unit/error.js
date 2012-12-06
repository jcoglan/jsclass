JS.Test.Unit.extend({
  Error: new JS.Class({
    initialize: function(testCase, exception) {
      this._testCase  = testCase;
      this._exception = exception;
    },
    
    testMetadata: function() {
      return this._testCase.metadata();
    },
    
    errorMetadata: function() {
      return {
        type:       'error',
        message:    this._exception.name + ': ' + this._exception.message,
        backtrace:  JS.Console.filterBacktrace(this._exception.stack)
      };
    }
  })
});

