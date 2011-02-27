JS.Test.Unit.extend({
  AutoRunner: new JS.Class({
    extend: {
      run: function(outputLevel) {
        var runner = this.getRunner(),
            names  = [],
            suites = [];
        
        JS.Test.Unit.TestCase.resolve();
        
        JS.Test.Unit.TestCase.forEach(function(testcase) {
          suites.push(testcase.suite());
          if (testcase.superclass === JS.Test.Unit.TestCase)
            names.push(testcase.displayName);
        });
        
        var suite = new JS.Test.Unit.TestSuite(names.join(', '));
        for (var i = 0, n = suites.length; i < n; i++)
          suite.push(suites[i]);
        
        JS.Test.Unit.TestCase.clear();
        return runner.run(suite, this.OUTPUT_LEVELS[outputLevel || 'normal']);
      },
      
      getRunner: function() {
        return (typeof window !== 'undefined')
              ? this.RUNNERS.browser
              : this.RUNNERS.console;
      },
      
      RUNNERS: {
        console:  JS.Test.Unit.UI.Console.TestRunner,
        browser:  JS.Test.Unit.UI.Browser.TestRunner
      },
      
      OUTPUT_LEVELS: {
        silent:   JS.Test.Unit.UI.SILENT,
        progress: JS.Test.Unit.UI.PROGRESS_ONLY,
        normal:   JS.Test.Unit.UI.NORMAL,
        verbose:  JS.Test.Unit.UI.VERBOSE
      }
    }
  })
});

JS.Test.extend({ autorun: JS.Test.Unit.AutoRunner.method('run') });

