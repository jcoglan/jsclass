Console.extend({
  Browser: new JS.Class(Console.Base, {
    backtraceFilter: function() {
      return new RegExp(window.location.href.replace(/(\/[^\/]+)/g, '($1)?') + '/?', 'g');
    },

    coloring: function() {
      return Console.AIR || Console.PHANTOM;
    },

    envvar: function(name) {
      if (Console.PHANTOM)
        return require('system').env[name] || null;
      else
        return window[name] || null;
    },

    getDimensions: function() {
      if (Console.AIR || Console.PHANTOM) return this.callSuper();
      return [1024, 1];
    },

    println: function(string) {
      if (window.runtime) return window.runtime.trace(string);
      if (window.console) return console.log(string);
      alert(string);
    }
  })
});

