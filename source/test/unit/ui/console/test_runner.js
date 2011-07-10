JS.Test.Unit.UI.extend({
  Console: new JS.Module({
    extend: {
      TestRunner: new JS.Class({
        extend: JS.Test.Unit.UI.TestRunnerUtilities,
        include: JS.Console,
        
        initialize: function(suite, outputLevel) {
          this._suite = (typeof suite.suite === 'function') ? suite.suite() : suite;
          this._outputLevel = outputLevel || JS.Test.Unit.UI.NORMAL;
          this._alreadyOutputted = false;
          this._faults = [];
        },
        
        start: function() {
          this._setupMediator();
          this._attachToMediator();
          return this._startMediator();
        },
        
        _setupMediator: function() {
          this._mediator = this._createMediator(this._suite);
          var suiteName = this._suite.toString();
          if (JS.isType(this._suite, JS.Module)) suiteName = this._suite.displayName;
          this.consoleFormat('bold');
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
          this.consoleFormat('bold', 'red');
          this._outputSingle(fault.singleCharacterDisplay(), JS.Test.Unit.UI.PROGRESS_ONLY);
          this.reset();
          this._alreadyOutputted = true;
        },
        
        _started: function(result) {
          this._result = result;
          this._nl();
          this.reset();
          this._output('Started');
        },
        
        _finished: function(elapsedTime) {
          for (var i = 0, n = this._faults.length; i < n; i++) {
            var message   = this._faults[i].longDisplay(),
                parts     = message.split('\n'),
                errorType = parts.shift(),
                testName  = parts.shift(),
                part;
            
            this.consoleFormat('bold', 'red');
            this._nl();
            this._output('\n' + (i + 1) + ') ' + errorType);
            this._output(testName);
            this.reset();
            while (part = parts.shift()) this.puts(part);
          }
          this.reset();
          this._nl();
          this._output('Finished in ' + elapsedTime + ' seconds');
          var color = this._result.passed() ? 'green' : 'red';
          this.consoleFormat(color);
          this._output(this._result, JS.Test.Unit.UI.PROGRESS_ONLY);
          this.reset();
          this.puts('');
          
          var status = this._result.passed() ? 0 : 1;
          
          if (typeof WScript !== 'undefined')            WScript.Quit(status);
          if (typeof process === 'object')               process.exit(status);
          if (typeof system === 'object' && system.exit) system.exit(status);
          if (typeof quit == 'function')                 quit(status);
        },
        
        _testStarted: function(testCase) {
          this._outputSingle(testCase.name() + ': ', JS.Test.Unit.UI.VERBOSE);
        },
        
        _testFinished: function(testCase) {
          this.consoleFormat('green');
          if (!this._alreadyOutputted) this._outputSingle('.', JS.Test.Unit.UI.PROGRESS_ONLY);
          this.reset();
          this._nl(JS.Test.Unit.UI.VERBOSE);
          this._alreadyOutputted = false;
        },
        
        _nl: function(level) {
          this._output('', level || JS.Test.Unit.UI.NORMAL);
        },
        
        _output: function(string, level) {
          if (!this._shouldOutput(level || JS.Test.Unit.UI.NORMAL)) return;
          this.puts(string);
        },
        
        _outputSingle: function(string, level) {
          if (!this._shouldOutput(level || JS.Test.Unit.UI.NORMAL)) return;
          this.print(string);
        },
        
        _shouldOutput: function(level) {
          return level <= this._outputLevel;
        }
      })
    }
  })
});

