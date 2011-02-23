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
          this._suite = (typeof suite.suite === 'function') ? suite.suite() : suite;
          this._faults = [];
          this._getDisplay();
        },
        
        _getDisplay: function() {
          return this._display = this._display || this.klass.Display.getInstance();
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
          
          if (!window.TestSwarm) return;
          
          TestSwarm.serialize = this.method('toHTML');
          this._mediator.addListener(JS.Test.Unit.TestCase.FINISHED, TestSwarm.heartbeat);
          
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.FINISHED,
          function() {
            TestSwarm.submit({
              fail:   this._result.failureCount(),
              error:  this._result.errorCount(),
              total:  this._result.runCount()
            });
          }, this);
        },
        
        _startMediator: function() {
          return this._mediator.runSuite();
        },
        
        _onChange: function() {
          this._getDisplay().setTestCount(this._result.runCount());
          this._getDisplay().setAssertionCount(this._result.assertionCount());
          this._getDisplay().setFailureCount(this._result.failureCount());
          this._getDisplay().setErrorCount(this._result.errorCount());
        },
        
        _addFault: function(fault) {
          this._faults.push(fault);
          this._getDisplay().addFault(this._currentTest, fault);
        },
        
        _started: function(result) {
          this._result = result;
        },
        
        _finished: function(elapsedTime) {
          this._getDisplay().printSummary(elapsedTime);
        },
        
        _testStarted: function(testCase) {
          this._currentTest = testCase;
          this._getDisplay().addTestCase(testCase);
        },
        
        _testFinished: function(testCase) {
          this._getDisplay().finishTestCase(testCase);
        },
        
        toHTML: function() {
          var html = '<h4>' + navigator.userAgent + '</h4>';
          if (this._faults.length > 0) {
            html += '<ul>';
            for (var i = 0, n = this._faults.length; i < n; i++) {
              html += '<li>' + this._faults[i].longDisplay().replace(/[\r\n]/, '<br>') + '</li>';
            }
            html += '</ul>';
          }
          html += this._result.toString();
          return html;
        }
      })
    }
  })
});

