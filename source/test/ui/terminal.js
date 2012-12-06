JS.Test.UI.extend({
  Terminal: new JS.Class({
    OPTIONS: {format: String, test: String},
    SHORTS:  {'f': '--format', 't': '--test'},
    
    prepare: function(callback, context) {
      callback.call(context || null, this);
    },
    
    getOptions: function() {
      var options = {};
      
      if (JS.Console.NODE) {
        options = require('nopt')(this.OPTIONS, this.SHORTS);
        if (process.env.TAP) options.format = 'tap';
        delete options.argv;
      }
      return options;
    },
    
    getReporters: function(options) {
      var reporters = [],
          R = JS.Test.Reporters;
      
      var Printer = R.find(options.format) || R.Dot;
      reporters.push(new Printer(options));
      reporters.push(new R.ExitStatus(options));
      
      return reporters;
    }
  })
});

