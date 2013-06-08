Test.UI.extend({
  Browser: new JS.Class({
    getOptions: function() {
      var qs      = (location.search || '').replace(/^\?/, ''),
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
          R         = Test.Reporters,
          reg       = R._registry,
          browser   = new R.Browser(options),
          reporter;

      reporters.push(new R.Coverage());
      reporters.push(browser);

      for (var name in reg) {
        reporter = reg[name] && reg[name].create && reg[name].create(options, browser);
        if (reporter) reporters.push(reporter);
      }

      return reporters;
    }
  })
});

