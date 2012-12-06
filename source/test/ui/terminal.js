JS.Test.UI.extend({
  Terminal: new JS.Class({
    prepare: function(callback, context) {
      callback.call(context || null, this);
    },
    
    getOptions: function() {
      var options = {};
      if (JS.Console.NODE) {
        if (process.env.TAP) options.format = 'tap';
      }
      // TODO complete this
      return options;
    },
    
    getReporters: function(options) {
      var reporters = [],
          R = JS.Test.Reporters;
      
      var Printer = R.find(options.format) || R.Progress;
      reporters.push(new Printer(options));
      reporters.push(new R.ExitStatus(options));
      
      return reporters;
    }
  })
});

