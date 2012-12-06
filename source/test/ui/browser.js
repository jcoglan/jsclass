JS.Test.UI.extend({
  Browser: new JS.Class({
    prepare: function(callback, context) {
      var hash = (window.location.hash || '').replace(/^#/, ''),
          self = this;
      
      if (hash === 'testem') {
        JS.Package.Loader.loadFile('/testem.js', function() {
          callback.call(context || null, self);
        });
      } else {
        callback.call(context || null, self);
      }
    },
    
    getOptions: function() {
      var qs      = (window.location.search || '').replace(/^\?/, ''),
          pairs   = qs.split('&'),
          options = {},
          parts;
      
      for (var i = 0, n = pairs.length; i < n; i++) {
        parts = pairs[i].split('=');
        options[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
      }
      return options;
    },
    
    getReporters: function(options) {
      var reporters = [],
          R         = JS.Test.Reporters,
          browser   = new R.Browser(options);
      
      reporters.push(browser);
      
      if (JS.ENV.TestSwarm)
        reporters.push(new R.TestSwarm(options, browser));
      else if (JS.ENV.Testem)
        reporters.push(new R.Testem(options));
      else
        reporters.push(new R.Console(options));
      
      return reporters;
    }
  })
});

