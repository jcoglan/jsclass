JS.Forwardable = new JS.Module({
  defineDelegator: function(subject, method, alias) {
    alias = alias || method;
    this.define(alias, function() {
      var object = this[subject], property = object[method];
      return JS.isFn(property)
          ? property.apply(object, arguments)
          : property;
    });
  },
  
  defineDelegators: function() {
    var methods = JS.array(arguments), subject = methods.shift();
    for (var i = 0, n = methods.length; i < n; i++)
      this.defineDelegator(subject, methods[i]);
  }
});
