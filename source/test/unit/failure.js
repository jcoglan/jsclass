JS.Test.Unit.extend({
  Failure: new JS.Class({
    extend: {
      SINGLE_CHARACTER: 'F'
    },
    
    initialize: function(testCase, message) {
      this._testCase = testCase;
      this._message  = message;
    },
    
    singleCharacterDisplay: function() {
      return this.klass.SINGLE_CHARACTER;
    },
    
    shortDisplay: function() {
      return this._testCase.name() + ': ' + this._message.split('\n')[0];
    },
    
    testMetadata: function() {
      return this._testCase.metadata();
    },
    
    errorMetadata: function() {
      return {
        type:     'failure',
        message:  this._message
      };
    },
    
    longDisplay: function() {
      return 'Failure:\n' + this._testCase.name() + ':\n' + this._message;
    },
    
    toString: function() {
      return this.longDisplay();
    }
  })
});

