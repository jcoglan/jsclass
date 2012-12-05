JS.Test.Unit.extend({
  Error: new JS.Class({
    extend: {
      SINGLE_CHARACTER: 'E'
    },
    
    initialize: function(testCase, exception) {
      this._testCase  = testCase;
      this._exception = exception;
    },
    
    singleCharacterDisplay: function() {
      return this.klass.SINGLE_CHARACTER;
    },
    
    testMetadata: function() {
      return this._testCase.metadata();
    },
    
    errorMetadata: function() {
      return {
        type:       'error',
        message:    this.message(),
        backtrace:  JS.Console.filterBacktrace(this._exception.stack)
      };
    },
    
    message: function() {
      return this._exception.name + ': ' + this._exception.message;
    },
    
    shortDisplay: function() {
      return this._testCase.name() + ': ' + this.message().split('\n')[0];
    },
    
    longDisplay: function() {
      var string = 'Error:\n' + this._testCase.name() + ':\n',
          trace  = JS.Console.filterBacktrace(this._exception.stack || '');
      
      if (trace && JS.Test.showStack)
        string += trace;
      else
        string += this.message();
      
      return string;
    },
    
    toString: function() {
      return this.longDisplay();
    }
  })
});

