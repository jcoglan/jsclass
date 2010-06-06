JS.Test.Unit.UI.extend({
  /** section: test
   * class JS.Test.Unit.UI.TestRunnerMediator
   * includes JS.Test.Unit.Util.Observable
   * 
   * Provides an interface to write any given UI against,
   * hopefully making it easy to write new UIs.
   **/
  TestRunnerMediator: new JS.Class({
    extend: {
      RESET:    'Test.Unit.UI.TestRunnerMediator.RESET',
      STARTED:  'Test.Unit.UI.TestRunnerMediator.STARTED',
      FINISHED: 'Test.Unit.UI.TestRunnerMediator.FINISHED'
    },
    
    include: JS.Test.Unit.Util.Observable,
    
    /**
     * new JS.Test.Unit.UI.TestRunnerMediator(suite)
     * 
     * Creates a new `TestRunnerMediator` initialized to run
     * the passed suite.
     **/
    initialize: function(suite) {
      this._suite = suite;
    },
    
    /**
     * JS.Test.Unit.UI.TestRunnerMediator#runSuite(continuation, context) -> JS.Test.Unit.TestResult
     * 
     * Runs the suite the `TestRunnerMediator` was created with.
     **/
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
    
    /**
     * JS.Test.Unit.UI.TestRunnerMediator#createResult() -> JS.Test.Unit.TestResult
     * 
     * A factory method to create the result the mediator
     * should run with. Can be overridden by subclasses if
     * one wants to use a different result.
     **/
    createResult: function() {
      return new JS.Test.Unit.TestResult();
    }
  })
});

