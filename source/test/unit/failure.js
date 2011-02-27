JS.Test.Unit.extend({
  Failure: new JS.Class({
    extend: {
      SINGLE_CHARACTER: 'F'
    },
    
    initialize: function(testName, message) {
      this._testName = testName;
      this._message  = message;
    },
    
    singleCharacterDisplay: function() {
      return this.klass.SINGLE_CHARACTER;
    },
    
    shortDisplay: function() {
      return this._testName + ': ' + this._message.split("\n")[0];
    },
    
    longDisplay: function() {
      return "Failure:\n" + this._testName + ":\n" + this._message;
    },
    
    toString: function() {
      return this.longDisplay();
    }
  })
});

