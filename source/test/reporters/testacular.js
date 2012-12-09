JS.Test.Reporters.extend({
  Testacular: new JS.Class({
    initialize: function(options) {
      this._tc = JS.ENV.__testacular__;
      this._testId = 0;
    },

    startRun: function(event) {
      this._tc.info({total: event.size});
    },
    
    startSuite: function(event) {},
    
    startTest: function(event) {
      this._faults = [];
      this._start  = new Date().getTime();
    },
    
    addFault: function(event) {
      var message = event.error.message;
      if (event.error.backtrace) message += '\n' + event.error.backtrace;
      this._faults.push(message);
    },
    
    endTest: function(event) {
      this._tc.result({
        id:          ++this._testId,
        description: event.shortName,
        suite:       event.context,
        success:     this._faults.length === 0,
        skipped:     0,
        time:        (new Date().getTime()) - this._start,
        log:         this._faults
      });
    },
    
    endSuite: function(event) {},
    
    update: function(event) {},
    
    endRun: function(event) {
      this._tc.complete();
    }
  })
});

