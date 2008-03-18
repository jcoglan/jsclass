JS.Forwardable = JS.Module({
  defineDelegator: function(subject, method, alias) {
    alias = alias || method;
    this.instanceMethod(alias, function() {
      var object = this[subject], property = object[method];
      return Function.is(property)
          ? property.apply(object, arguments)
          : property;
    });
  },
  
  defineDelegators: function() {
    var methods = Array.from(arguments), subject = methods.shift();
    for (var i = 0, n = methods.length; i < n; i++)
      this.defineDelegator(subject, methods[i]);
  }
});
