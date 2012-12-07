JS.Test.Reporters.extend({
  Error: new JS.Class(JS.Test.Reporters.Dot, {
    startRun: function(event) {
      this._faults = [];
    },
    
    addFault: function(event) {
      this._faults.push(event);
      this._printFault(this._faults.length, event);
    },
    
    endTest: function(event) {},
    
    endRun: function(event) {
      this._printSummary(event);
    }
  })
});

JS.Test.Reporters.register('error', JS.Test.Reporters.Error);

