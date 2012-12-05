JS.Test.Unit.extend({
  AutoRunner: new JS.Class({
    extend: {
      run: function(outputLevel) {
        var runner = this.getRunner(),
            filter = runner.getFilter(),
            names  = [],
            suites = [];
        
        JS.Test.Unit.TestCase.resolve();
        
        JS.Test.Unit.TestCase.forEach(function(testcase) {
          var suite = testcase.suite(filter);
          if (suite.size() > 0) suites.push(suite);
          if (testcase.superclass === JS.Test.Unit.TestCase)
            names.push(testcase.displayName);
        });
        
        var suite = new JS.Test.Unit.TestSuite(names);
        for (var i = 0, n = suites.length; i < n; i++)
          suite.push(suites[i]);
        
        JS.Test.Unit.TestCase.clear();
        return runner.run(suite, this.OUTPUT_LEVELS[outputLevel || 'normal']);
      },
      
      filter: function(objects, suffix) {
        var filter = this.getRunner().getFilter(),
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

