JS.Test = new JS.Module('Test', {
  extend: {
    Unit: new JS.Module({
      extend: {
        AssertionFailedError: new JS.Class(Error, {
          initialize: function(message) {
            this.message = message.toString();
          }
        })
      }
    }),
    
    asyncTimeout: 10,
    showStack:    true,
    
    filter: function(objects, suffix) {
      return this.Unit.AutoRunner.filter(objects, suffix);
    },
    
    Reporters: new JS.Module({
      extend: {
        METHODS: ['startRun', 'startSuite', 'startTest', 'addFault', 'endTest', 'endSuite', 'endRun']
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

