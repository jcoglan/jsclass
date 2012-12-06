JS.Test = new JS.Module('Test', {
  extend: {
    Unit: new JS.Module({}),
    
    asyncTimeout: 10,
    
    filter: function(objects, suffix) {
      return JS.Test.Runner.filter(objects, suffix);
    },
    
    Reporters: new JS.Module({
      extend: {
        METHODS: ['startRun', 'startSuite', 'startTest',
                  'update', 'addFault',
                  'endTest', 'endSuite', 'endRun']
      }
    }),
    
    addReporter: function(reporter) {
      var current = this.reporter;
      if (!(reporter instanceof JS.Test.Reporters.Composite)) {
        this.reporter = new JS.Test.Reporters.Composite();
        this.reporter.addReporter(current);
      }
      this.reporter.addReporter(reporter);
    },
    
    setReporter: function(reporter, replace) {
      if (this.reporter && replace !== false) return;
      this.reporter = reporter;
    }
  }
});

