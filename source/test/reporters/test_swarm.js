JS.Test.Reporters.extend({
  TestSwarm: new JS.Class({
    initialize: function(browserReporter) {
      this._browserReporter = browserReporter;
      if (!JS.ENV.TestSwarm) return;
      
      TestSwarm.serialize = function() {
        return browserReporter.serialize();
      };
    },
    
    startRun: function(event) {},
    
    startSuite: function(event) {},
    
    startTest: function(event) {},
    
    addFault: function(event) {},
    
    endTest: function(event) {
      if (JS.ENV.TestSwarm) TestSwarm.heartbeat();
    },
    
    endSuite: function(event) {},
    
    update: function(event) {},
    
    endRun: function(event) {
      if (!JS.ENV.TestSwarm) return;
      
      TestSwarm.submit({
        fail:   event.failures,
        error:  event.errors,
        total:  event.tests
      });
    }
  })
});

