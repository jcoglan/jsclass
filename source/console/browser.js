Console.extend({
  Browser: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(window.location.href.replace(/(\/[^\/]+)/g, '($1)?') + '/?', 'g');
    },

    coloring: function() {
      if (this.envvar(Console.NO_COLOR)) return false;
      return Console.AIR;
    },

    echo: function(string) {
      if (window.runtime) return window.runtime.trace(string);
      if (window.console) return console.log(string);
      alert(string);
    },

    envvar: function(name) {
      return window[name] || null;
    },

    getDimensions: function() {
      if (Console.AIR) return this.callSuper();
      return [1024, 1];
    }
  })
});

