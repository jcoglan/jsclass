JS.Forwardable = {
  extended: function(klass) {
    klass.extend({
      
      defineDelegator: function(subject, method, alias) {
        alias = alias || method;
        this.instanceMethod(alias, function() {
          var object = this[subject];
          return object[method].apply(object, arguments);
        });
      },
      
      defineDelegators: function() {
        var methods = Array.from(arguments), subject = methods.shift();
        for (var i = 0, n = methods.length; i < n; i++)
          this.defineDelegator(subject, methods[i]);
      }
    });
  }
};
