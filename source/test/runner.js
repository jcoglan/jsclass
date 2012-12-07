JS.Test.extend({
  Runner: new JS.Class({
    initialize: function(settings) {
      this._settings = (typeof settings === 'string')
                     ? {format: settings}
                     : (settings || {});
    },
    
    run: function(callback, context) {
      var ui = this.klass.getUI(this._settings);
      ui.prepare(function() {
        this.start(ui, callback, context);
      }, this);
    },
    
    start: function(ui, callback, context) {
      var options   = ui.getOptions(),
          reporters = ui.getReporters(options),
          suite     = this.getSuite(options);
      
      this.setReporter(new JS.Test.Reporters.Composite(reporters));
      if (callback) callback.call(context || null, this);
      
      var startTime  = new Date().getTime(),
          testResult = new JS.Test.Unit.TestResult(),
          TR         = JS.Test.Unit.TestResult,
          TS         = JS.Test.Unit.TestSuite,
          TC         = JS.Test.Unit.TestCase;
      
      var resultListener = testResult.addListener(TR.CHANGED, function() {
        var result = testResult.metadata(),
            time   = new Date().getTime();
        
        result.runtime = (time - startTime) / 1000;
        this._reporter.update(result);
      }, this);
      
      var faultListener = testResult.addListener(TR.FAULT, function(fault) {
        this._reporter.addFault(fault.metadata());
      }, this);
      
      var reportResult = function() {
        testResult.removeListener(TR.CHANGED, resultListener);
        testResult.removeListener(TR.FAULT, faultListener);
        
        var endTime     = new Date().getTime(),
            elapsedTime = (endTime - startTime) / 1000;
        
        // TODO output reports
        var result = testResult.metadata();
        result.runtime = elapsedTime;
        this._reporter.endRun(result);
      };
      
      var reportEvent = function(channel, testCase) {
        if (channel === TS.STARTED)
          this._reporter.startSuite(testCase.metadata());
        else if (channel === TC.STARTED)
          this._reporter.startTest(testCase.metadata());
        else if (channel === TC.FINISHED)
          this._reporter.endTest(testCase.metadata());
        else if (channel === TS.FINISHED)
          this._reporter.endSuite(testCase.metadata());
      };
      
      this._reporter.startRun(suite.metadata());
      
      suite.run(testResult, reportResult, reportEvent, this);
    },
    
    addReporter: function(reporter) {
      var current = this._reporter;
      if (!(current instanceof JS.Test.Reporters.Composite)) {
        this._reporter = new JS.Test.Reporters.Composite();
        this._reporter.addReporter(current);
      }
      this._reporter.addReporter(reporter);
    },
    
    setReporter: function(reporter) {
      this._reporter = reporter;
    },
    
    getSuite: function(options) {
      var filter = options.test,
          names  = [],
          suites = [];
      
      JS.Test.Unit.TestCase.resolve();
      
      JS.Test.Unit.TestCase.forEach(function(testcase) {
        var suite = testcase.suite(filter);
        if (suite.size() > 0) suites.push(suite);
        if (testcase.superclass === JS.Test.Unit.TestCase)
          names.push(testcase.displayName);
      });
      
      var suite = new JS.Test.Unit.TestSuite({
        fullName:   names.join(', '),
        shortName:  null,
        context:    null
      });
      for (var i = 0, n = suites.length; i < n; i++)
        suite.push(suites[i]);
      
      JS.Test.Unit.TestCase.clear();
      return suite;
    },
    
    extend: {
      getUI: function(settings) {
        if (JS.Console.BROWSER && !JS.Console.PHANTOM)
          return new JS.Test.UI.Browser(settings);
        else
          return new JS.Test.UI.Terminal(settings);
      },
      
      filter: function(objects, suffix) {
        var filter = this.getUI().getOptions().test,
            n      = filter.length,
            output = [],
            m, object;
        
        if (n === 0) return objects;
        
        while (n--) {
          m = objects.length;
          while (m--) {
            object = objects[m].replace(new RegExp(suffix + '$'), '');
            if (filter[n].substr(0, object.length) === object)
              output.push(objects[m]);
          }
        }
        return output;
      }
    }
  }),
  
  autorun: function(options, callback, context) {
    if (typeof options === 'function') {
      context  = callback;
      callback = options;
      options  = {};
    }
    if (typeof callback !== 'function') {
      callback = undefined;
      context  = undefined;
    }
    var runner = new JS.Test.Runner(options);
    runner.run(callback, context);
  }
});

