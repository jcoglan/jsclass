var Test = new JS.Module('Test', {
  extend: {
    asyncTimeout: 5,

    filter: function(objects, suffix) {
      return Test.Runner.filter(objects, suffix);
    },

    Reporters: new JS.Module({
      extend: {
        METHODS: ['startSuite', 'startContext', 'startTest',
                  'update', 'addFault',
                  'endTest', 'endContext', 'endSuite'],

        _registry: {},

        register: function(name, klass) {
          this._registry[name] = klass;
        },

        get: function(name) {
          if (!name) return null;
          return this._registry[name] || null;
        }
      }
    }),

    UI:   new JS.Module({}),
    Unit: new JS.Module({})
  }
});

