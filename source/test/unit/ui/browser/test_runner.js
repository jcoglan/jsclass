JS.Test.Unit.UI.extend({
  Browser: new JS.Module({
    extend: {
      TestRunner: new JS.Class({
        extend: JS.Test.Unit.UI.TestRunnerUtilities,
        
        initialize: function(suite, outputLevel) {
          this._suite = (typeof suite.suite === 'function') ? suite.suite() : suite;
          this._faults = [];
          this._getDisplay();
        },
        
        _getDisplay: function() {
          return this._display = this._display || new this.klass.Display();
        },
        
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
          
          TestSwarm.serialize = this.method('serialize');
          this._mediator.addListener(JS.Test.Unit.TestCase.FINISHED, TestSwarm.heartbeat);
          
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.FINISHED,
          function() {
            TestSwarm.submit(this._resultSummary());
          }, this);
        },
        
        _resultSummary: function() {
          return {
            fail:   this._result.failureCount(),
            error:  this._result.errorCount(),
            total:  this._result.runCount()
          };
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
          this._status = 'failed';
          this._getDisplay().addFault(this._currentTest, fault);
        },
        
        _started: function(result) {
          this._result = result;
        },
        
        _finished: function(elapsedTime) {
          this._getDisplay().printSummary(elapsedTime);
          this._outputJSON({jstest: this._resultSummary()});
        },
        
        _testStarted: function(testCase) {
          this._currentTest = testCase;
          this._status = 'passed';
          this._getDisplay().addTestCase(testCase);
        },
        
        _testFinished: function(testCase) {
          this._getDisplay().finishTestCase(testCase);
          this._outputJSON({jstest: {test: testCase.toString(), status: this._status}});
        },
        
        _outputJSON: function(object) {
          if (window.console && window.JSON && !window.Components)
            console.log(JSON.stringify(object));
        },
        
        serialize: function() {
          var items = document.getElementsByTagName('li'),
              n     = items.length;
          
          while (n--) JS.DOM.removeClass(items[n], 'closed');
          
          var items = document.getElementsByTagName('script'),
              n     = items.length;
          
          while (n--) items[n].parentNode.removeChild(items[n]);
          
          var html = document.getElementsByTagName('html')[0];
          return '<!doctype html><html>' + html.innerHTML + '</html>';
        }
      })
    }
  })
});

