JS.Console.extend({
  Browser: new JS.Class(JS.Console.Base, {
    backtraceFilter: function() {
      return new RegExp(window.location.href.replace(/(\/[^\/]+)/g, '($1)?') + '/?', 'g');
    },

    coloring: function() {
      return !window.runtime;
    },

    envvar: function(name) {
      if (JS.Console.PHANTOM)
        return require('system').env[name] || null;
      else
        return window[name] || null;
    },

    getDimensions: function() {
      if (JS.Console.PHANTOM) return this.callSuper();
      return [1024, 1];
    },

    println: function(string) {
      if (window.runtime) return window.runtime.trace(string);
      if (window.console) return console.log(string);
      alert(string);
    }
  })
});

