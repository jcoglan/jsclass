JS.Test = new JS.Module('Test', {
  extend: {
    Unit: new JS.Module({}),
    
    asyncTimeout: 10,
    
    filter: function(objects, suffix) {
      return JS.Test.Runner.filter(objects, suffix);
    },
    
    UI: new JS.Module({}),
    
    Reporters: new JS.Module({
      extend: {
        METHODS: ['startRun', 'startSuite', 'startTest',
                  'update', 'addFault',
                  'endTest', 'endSuite', 'endRun'],
        
        _registry: {},
        
        register: function(name, klass) {
          this._registry[name] = klass;
        },
        
        find: function(name) {
          if (!name) return null;
          return this._registry[name] || null;
        }
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

