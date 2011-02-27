JS.Test.Unit.UI.extend({
  TestRunnerMediator: new JS.Class({
    extend: {
      RESET:    'Test.Unit.UI.TestRunnerMediator.RESET',
      STARTED:  'Test.Unit.UI.TestRunnerMediator.STARTED',
      FINISHED: 'Test.Unit.UI.TestRunnerMediator.FINISHED'
    },
    
    include: JS.Test.Unit.Util.Observable,
    
    initialize: function(suite) {
      this._suite = suite;
    },
    
    runSuite: function(continuation, context) {
      var beginTime = new Date().getTime();
      this.notifyListeners(this.klass.RESET, this._suite.size());
      var result = this.createResult();
      this.notifyListeners(this.klass.STARTED, result);
      
      var reportResult = JS.bind(function() {
        result.removeListener(JS.Test.Unit.TestResult.FAULT, faultListener);
        result.removeListener(JS.Test.Unit.TestResult.CHANGED, resultListener);
        
        var endTime     = new Date().getTime(),
            elapsedTime = (endTime - beginTime) / 1000;
        
        this.notifyListeners(this.klass.FINISHED, elapsedTime);
        
        var reports = JS.Test.Unit.TestCase.reports,
            i = reports.length;
        
        while (i--) reports[i].report();
        JS.Test.Unit.TestCase.reports = [];
        
        if (continuation) continuation.call(context || null, result);
      }, this);
      
      var resultListener = result.addListener(JS.Test.Unit.TestResult.CHANGED, function(updatedResult) {
        this.notifyListeners(JS.Test.Unit.TestResult.CHANGED, updatedResult);
      }, this);
      
      var faultListener = result.addListener(JS.Test.Unit.TestResult.FAULT, function(fault) {
        this.notifyListeners(JS.Test.Unit.TestResult.FAULT, fault);
      }, this);
      
      this._suite.run(result, reportResult, function(channel, value) {
        this.notifyListeners(channel, value);
      }, this);
    },
    
    createResult: function() {
      return new JS.Test.Unit.TestResult();
    }
  })
});

