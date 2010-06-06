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
        
        _testStarted: function(name) {
          
        },
        
        _testFinished: function(name) {
          
        }
      })
    }
  })
});

JS.Test.Unit.UI.Browser.TestRunner.extend({
  Display: new JS.Class({
    extend: {
      getInstance: function() {
        return this._instance = this._instance || new this();
      }
    },
    
    initialize: function() {
      this._constructDOM();
      document.body.insertBefore(this._container, document.body.firstChild);
    },
    
    _constructDOM: function() {
      var self = this;
      self._container = JS.DOM.div({className: 'test-result-container'}, function(div) {
        div.h1('Test results');
        div.table({className: 'summary'}, function(table) {
          table.thead(function(thead) {
            thead.tr(function(tr) {
              tr.th({scope: 'col'}, 'Tests');
              tr.th({scope: 'col'}, 'Assertions');
              tr.th({scope: 'col'}, 'Failures');
              tr.th({scope: 'col'}, 'Errors');
            });
          });
          table.tbody(function(tbody) {
            tbody.tr(function(tr) {
              self._tests      = tr.td();
              self._assertions = tr.td();
              self._failures   = tr.td();
              self._errors     = tr.td();
            });
          });
        });
        self._reports = div.ol({className: 'reports'});
      });
    },
    
    setTestCount: function(n) {
      this._tests.innerHTML = String(n);
    },
    
    setAssertionCount: function(n) {
      this._assertions.innerHTML = String(n);
    },
    
    setFailureCount: function(n) {
      this._failures.innerHTML = String(n);
    },
    
    setErrorCount: function(n) {
      this._errors.innerHTML = String(n);
    },
    
    addReport: function(string) {
      var item = JS.DOM.li(function(li) {
        li.p(function(p) {
          var parts = string.split(/[\r\n]+/);
          for (var i = 0, n = parts.length; i < n; i++) {
            if (i > 0) p.br();
            p.concat(parts[i]);
          }
        });
      });
      this._reports.appendChild(item);
    }
  })
});

