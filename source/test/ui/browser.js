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
          parts, key, value;
      
      for (var i = 0, n = pairs.length; i < n; i++) {
        parts = pairs[i].split('=');
        key   = decodeURIComponent(parts[0]);
        value = decodeURIComponent(parts[1]);
        
        if (/\[\]$/.test(parts[0])) {
          key = key.replace(/\[\]$/, '');
          if (!(options[key] instanceof Array)) options[key] = [];
          options[key].push(value);
        } else {
          options[key] = value;
        }
      }
      
      if (options.test)
        options.test = [].concat(options.test);
      else
        options.test = [];
      
      return options;
    },
    
    getReporters: function(options) {
      var reporters = [],
          R         = JS.Test.Reporters,
          browser   = new R.Browser(options);
      
      reporters.push(browser);
      
      if (JS.ENV.buster)
        reporters.push(new R.Buster(options));
      else if (JS.ENV.Testem)
        reporters.push(new R.Testem(options));
      else if (JS.ENV.TestSwarm)
        reporters.push(new R.TestSwarm(options, browser));
      
      return reporters;
    }
  })
});

