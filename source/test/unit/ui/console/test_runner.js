JS.Test.Unit.UI.extend({
  Console: new JS.Module({
    extend: {
      /** section: test
       * class JS.Test.Unit.UI.Console.TestRunner
       * 
       * Runs a `JS.Test.Unit.TestSuite` on the console.
       **/
      TestRunner: new JS.Class({
        extend: [JS.Test.Unit.UI.TestRunnerUtilities, {
          
          ANSI_CSI: String.fromCharCode(0x1B) + '['
        }],
        
        /**
         * new JS.Test.Unit.UI.Console.TestRunner(suite, outputLevel)
         * 
         * Creates a new `JS.Test.Unit.UI.Console.TestRunner`
         * for running the passed `suite`.
         **/
        initialize: function(suite, outputLevel) {
          this._suite = JS.isFn(suite.suite) ? suite.suite() : suite;
          this._outputLevel = outputLevel || JS.Test.Unit.UI.NORMAL;
          this._alreadyOutputted = false;
          this._faults = [];
          this._lineBuffer = [];
        },
        
        /**
         * JS.Test.Unit.UI.Console.TestRunner#start() -> undefined
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
          var suiteName = this._suite.toString();
          if (JS.isType(this._suite, JS.Module))
            suiteName = this._suite.displayName;
          this._output('Loaded suite ' + suiteName);
        },
        
        _createMediator: function(suite) {
          return new JS.Test.Unit.UI.TestRunnerMediator(suite);
        },
        
        _attachToMediator: function() {
          this._mediator.addListener(JS.Test.Unit.TestResult.FAULT, this.method('_addFault'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.STARTED, this.method('_started'));
          this._mediator.addListener(JS.Test.Unit.UI.TestRunnerMediator.FINISHED, this.method('_finished'));
          this._mediator.addListener(JS.Test.Unit.TestCase.STARTED, this.method('_testStarted'));
          this._mediator.addListener(JS.Test.Unit.TestCase.FINISHED, this.method('_testFinished'));
        },
        
        _startMediator: function() {
          return this._mediator.runSuite();
        },
        
        _addFault: function(fault) {
          this._faults.push(fault);
          this._outputSingle(fault.singleCharacterDisplay(), JS.Test.Unit.UI.PROGRESS_ONLY);
          this._alreadyOutputted = true;
        },
        
        _started: function(result) {
          this._result = result;
          this._output('Started');
        },
        
        _finished: function(elapsedTime) {
          this._nl();
          this._output('Finished in ' + elapsedTime + ' seconds.');
          for (var i = 0, n = this._faults.length; i < n; i++) {
            this._nl();
            this._output((i + 1) + ') ' + this._faults[i].longDisplay());
          }
          this._nl();
          this._output(this._result, JS.Test.Unit.UI.PROGRESS_ONLY);
        },
        
        _testStarted: function(testCase) {
          this._outputSingle(testCase.name() + ': ', JS.Test.Unit.UI.VERBOSE);
        },
        
        _testFinished: function(testCase) {
          if (!this._alreadyOutputted) this._outputSingle('.', JS.Test.Unit.UI.PROGRESS_ONLY);
          this._nl(JS.Test.Unit.UI.VERBOSE);
          this._alreadyOutputted = false;
        },
        
        _nl: function(level) {
          this._output('', level || JS.Test.Unit.UI.NORMAL);
        },
        
        _output: function(string, level) {
          if (!this._shouldOutput(level || JS.Test.Unit.UI.NORMAL)) return;
          this._lineBuffer = [];
          this._print(string);
        },
        
        _outputSingle: function(string, level) {
          if (!this._shouldOutput(level || JS.Test.Unit.UI.NORMAL)) return;
          
          if (typeof process === 'object') return require('sys').print(string);
          
          var esc = (this._lineBuffer.length === 0) ? '' : this._escape('F') + this._escape('K');
          this._lineBuffer.push(string);
          this._print(esc + this._lineBuffer.join(''));
        },
        
        _shouldOutput: function(level) {
          return level <= this._outputLevel;
        },
        
        _print: function(string) {
          if (typeof process === 'object') return require('sys').puts(string);
          if (typeof WScript !== 'undefined') return WScript.Echo(string);
          if (typeof print === 'function') return print(string);
        },
        
        _escape: function(string) {
          return this.klass.ANSI_CSI + string;
        }
      })
    }
  })
});

