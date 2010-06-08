JS.Test.Unit.UI.extend({
  Browser: new JS.Module({
    extend: {
      /** section: test
       * class JS.Test.Unit.UI.Browser.TestRunner
       * 
       * Runs a `JS.Test.Unit.TestSuite` in the browser.
       **/
      TestRunner: new JS.Class({
        extend: JS.Test.Unit.UI.TestRunnerUtilities,
        
        /**
         * new JS.Test.Unit.UI.Browser.TestRunner(suite, outputLevel)
         * 
         * Creates a new `JS.Test.Unit.UI.Browser.TestRunner`
         * for running the passed `suite`.
         **/
        initialize: function(suite, outputLevel) {
          this._suite = JS.isFn(suite.suite) ? suite.suite() : suite;
          this._faults = [];
          this._getDisplay();
        },
        
        _getDisplay: function() {
          this._display = this.klass.Display.getInstance();
        },
        
        /**
         * JS.Test.Unit.UI.Browser.TestRunner#start() -> undefined
         * 
         * Begins the test run.
         **/
        start: function() {
          this._setupMediator();
          this._attachToMediator();
          return this._startMediator();
        },
        
        _setupMediator: function() {
          this._mediator = this._createMediator(this._suite);
        },
        
        _createMediator: function(suite) {
          return new JS.Test.Unit.UI.TestRunnerMediator(suite);
        },
        
        _attachToMediator: function() {
          this._mediator.addListener(JS.Test.Unit.TestResult.CHANGED, this.method('_onChange'));
          this._mediator.addListener(JS.Test.Unit.TestResult.FAULT, this.method('_addFault'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.STARTED, this.method('_started'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.FINISHED, this.method('_finished'));
          this._mediator.addListener(JS.Test.Unit.TestCase.STARTED, this.method('_testStarted'));
          this._mediator.addListener(JS.Test.Unit.TestCase.FINISHED, this.method('_testFinished'));
        },
        
        _startMediator: function() {
          return this._mediator.runSuite();
        },
        
        _onChange: function() {
          this._display.setTestCount(this._result.runCount());
          this._display.setAssertionCount(this._result.assertionCount());
          this._display.setFailureCount(this._result.failureCount());
          this._display.setErrorCount(this._result.errorCount());
        },
        
        _addFault: function(fault) {
          this._faults.push(fault);
          this._display.addReport(fault.longDisplay());
        },
        
        _started: function(result) {
          this._result = result;
        },
        
        _finished: function(elapsedTime) {
          
        },
        
        _testStarted: function(testCase) {
          this._display.addTestCase(testCase);
        },
        
        _testFinished: function(testCase) {
          
        }
      })
    }
  })
});

