Console.extend({
  Browser: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(window.location.href.replace(/(\/[^\/]+)/g, '($1)?') + '/?', 'g');
    },

    coloring: function() {
      return !window.runtime;
    },

    envvar: function(name) {
      if (typeof phantom !== 'undefined')
        return require('system').env[name] || null;
      else
        return window[name] || null;
    },

    maxBufferLength: function() {
      return 1000;
    },

    println: function(string) {
      if (window.runtime) return window.runtime.trace(string);
      if (window.console) return console.log(string);
      alert(string);
    }
  })
});

