JS.Test.Unit.extend({
  Failure: new JS.Class({
    initialize: function(testCase, message) {
      this._testCase = testCase;
      this._message  = message;
    },
    
    testMetadata: function() {
      return this._testCase.metadata();
    },
    
    errorMetadata: function() {
      return {
        type:     'failure',
        message:  this._message
      };
    }
  })
});

