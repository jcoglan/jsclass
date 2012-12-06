JS.Test.Unit.extend({
  Failure: new JS.Class({
    initialize: function(testCase, message) {
      this._testCase = testCase;
      this._message  = message;
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
        type:     'failure',
        message:  this._message
      };
    }
  })
});

