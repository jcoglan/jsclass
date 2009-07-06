/** section: test
 * class JS.Test.Unit.Failure
 * 
 * Encapsulates a test failure. Created by `JS.Test.Unit.TestCase`
 * when an assertion fails.
 **/
JS.Test.Unit.extend({
  Failure: new JS.Class({
    extend: {
      SINGLE_CHARACTER: 'F'
    },
    
    /**
     * new JS.Test.Unit.Failure(testName, location, message)
     * 
     * Creates a new `JS.Test.Unit.Failure` with the given location and
     * message.
     **/
    initialize: function(testName, location, message) {
      this._testName = testName;
      this._location = location;
      this._message  = message;
      this.toString = this.longDisplay;
    },
    
    /**
     * JS.Test.Unit.Failure#singleCharacterDisplay() -> String
     * 
     * Returns a single character representation of a failure.
     **/
    singleCharacterDisplay: function() {
      return this.klass.SINGLE_CHARACTER;
    },
    
    /**
     * JS.Test.Unit.Failure#shortDisplay() -> String
     * 
     * Returns a brief version of the error description.
     **/
    shortDisplay: function() {
      return this._testName + ': ' + this._message.split("\n")[0];
    },
    
    /**
     * JS.Test.Unit.Failure#longDisplay() -> String
     * 
     * Returns a verbose version of the error description.
     **/
    longDisplay: function() {
      var locationDisplay = (this._location.length === 1)
          ? this._location[0].replace(/\A(.+:\d+).*/, ' [$1]')
          : "\n    [" + this._location.join("\n     ") + "]";
      
      return "Failure:\n" + this._testName + locationDisplay + ":\n" + this._message;
    }
  })
});

