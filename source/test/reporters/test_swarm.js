JS.Test.Reporters.extend({
  TestSwarm: new JS.Class({
    initialize: function(options, browserReporter) {
      this._browserReporter = browserReporter;
      
      TestSwarm.serialize = function() {
        return browserReporter.serialize();
      };
    },
    
    startRun: function(event) {},
    
    startSuite: function(event) {},
    
    startTest: function(event) {},
    
    addFault: function(event) {},
    
    endTest: function(event) {
      TestSwarm.heartbeat();
    },
    
    endSuite: function(event) {},
    
    update: function(event) {},
    
    endRun: function(event) {
      TestSwarm.submit({
        fail:   event.failures,
        error:  event.errors,
        total:  event.tests
      });
    }
  })
});

