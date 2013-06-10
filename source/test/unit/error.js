Test.Unit.extend({
  Error: new JS.Class({
    initialize: function(testCase, exception) {
      if (typeof exception === 'string')
        exception = new Error(exception);

      this._testCase  = testCase;
      this._exception = exception;
    },

    metadata: function() {
      return {
        test:   this.testMetadata(),
        error:  this.errorMetadata()
      }
    },

    testMetadata: function() {
      return this._testCase.metadata();
    },

    errorMetadata: function() {
      return {
        type:       'error',
        message:    this._exception.name + ': ' + this._exception.message,
        backtrace:  Console.filterBacktrace(this._exception.stack)
      };
    }
  })
});

