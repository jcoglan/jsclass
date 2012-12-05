JS.Test.Unit.UI.extend({
  Browser: new JS.Module({
    extend: {
      TestRunner: new JS.Class({
        extend: JS.Test.Unit.UI.TestRunnerUtilities,
        
        initialize: function(suite, outputLevel) {
          this._suite = (typeof suite.suite === 'function') ? suite.suite() : suite;
        },
        
        start: function() {
          var browser   = new JS.Test.Reporters.Browser(),
              testSwarm = new JS.Test.Reporters.TestSwarm(browser);
          
          JS.Test.setReporter(new JS.Test.Reporters.Composite([
            browser,
            new JS.Test.Reporters.Console(),
            testSwarm
          ]), false);
          
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
          JS.Test.reporter.update({
            runtime:    0,
            passed:     this._result.passed(),
            tests:      this._result.runCount(),
            assertions: this._result.assertionCount(),
            failures:   this._result.failureCount(),
            errors:     this._result.errorCount()
          });
        },
        
        _addFault: function(fault) {
          JS.Test.reporter.addFault({
            test:   fault.testMetadata(),
            error:  fault.errorMetadata()
          });
        },
        
        _started: function(result) {
          JS.Test.reporter.startRun({suites: this._suite.toString()});
          this._result = result;
        },
        
        _finished: function(elapsedTime, reportStatus) {
          JS.Test.reporter.endRun({
            runtime:    elapsedTime,
            passed:     this._result.passed(),
            tests:      this._result.runCount(),
            assertions: this._result.assertionCount(),
            failures:   this._result.failureCount(),
            errors:     this._result.errorCount()
          });
        },
        
        _testStarted: function(testCase) {
          JS.Test.reporter.startTest(testCase.metadata());
        },
        
        _testFinished: function(testCase) {
          JS.Test.reporter.endTest(testCase.metadata());
        }
      })
    }
  })
});

