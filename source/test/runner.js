JS.Test.extend({
  Runner: new JS.Class({
    initialize: function(settings) {
      this._settings = (typeof settings === 'string')
                     ? {format: settings}
                     : (settings || {});
    },
    
    run: function() {
      var ui = this.getUI(this._settings);
      ui.prepare(this.start, this);
    },
    
    start: function(ui) {
      var options   = ui.getOptions(),
          reporters = ui.getReporters(options),
          suite     = this.getSuite(options);
      
      JS.Test.setReporter(new JS.Test.Reporters.Composite(reporters), false);
      
      var startTime  = new Date().getTime();
          testResult = new JS.Test.Unit.TestResult(),
          TR         = JS.Test.Unit.TestResult,
          TS         = JS.Test.Unit.TestSuite,
          TC         = JS.Test.Unit.TestCase;
      
      var resultListener = testResult.addListener(TR.CHANGED, function() {
        var result = testResult.metadata(),
            time   = new Date().getTime();
        
        result.runtime = (time - startTime) / 1000;
        JS.Test.reporter.update(result);
      });
      
      var faultListener = testResult.addListener(TR.FAULT, function(fault) {
        JS.Test.reporter.addFault(fault.metadata());
      });
      
      var reportResult = function() {
        testResult.removeListener(TR.CHANGED, resultListener);
        testResult.removeListener(TR.FAULT, faultListener);
        
        var endTime     = new Date().getTime(),
            elapsedTime = (endTime - startTime) / 1000;
        
        // TODO output reports
        var result = testResult.metadata();
        result.runtime = elapsedTime;
        JS.Test.reporter.endRun(result);        
      };
      
      var reportEvent = function(channel, testCase) {
        if (channel === TS.STARTED)
          JS.Test.reporter.startSuite(testCase.metadata());
        else if (channel === TC.STARTED)
          JS.Test.reporter.startTest(testCase.metadata());
        else if (channel === TC.FINISHED)
          JS.Test.reporter.endTest(testCase.metadata());
        else if (channel === TS.FINISHED)
          JS.Test.reporter.endSuite(testCase.metadata());
      };
      
      JS.Test.reporter.startRun(suite.metadata());
      
      suite.run(testResult, reportResult, reportEvent, this);
    },
    
    getUI: function(settings) {
      if (JS.Console.BROWSER)
        return new JS.Test.UI.Browser(settings);
      else
        return new JS.Test.UI.Terminal(settings);
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
      filter: function(objects, suffix) {
        var filter = [], // TODO implement this
            output = [],
            n      = filter.length,
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
  
  autorun: function(options) {
    var runner = new JS.Test.Runner(options);
    runner.run();
  }
});

