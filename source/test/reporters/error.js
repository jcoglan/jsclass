Test.Reporters.extend({
  Error: new JS.Class(Test.Reporters.Dot, {
    startSuite: function(event) {
      this._faults = [];
    },

    addFault: function(event) {
      this._faults.push(event);
      this._printFault(this._faults.length, event);
    },

    endTest: function(event) {},

    endSuite: function(event) {
      this._printSummary(event);
    }
  })
});

Test.Reporters.register('error', Test.Reporters.Error);

