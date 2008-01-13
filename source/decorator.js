JS.Decorator = function() {
  var args = Array.from(arguments), klass = args.shift(), arg;
  var decorator = JS.Class();
  
  var forward = function(name) {
    return function() {
      return this.component[name].apply(this.component, arguments);
    };
  };
  
  for (var method in klass.prototype) {
    func = klass.prototype[method];
    if (typeof func == 'function') func = forward(method);
    decorator.instanceMethod(method, func);
  }
  
  decorator.include({
    initialize: function(component) {
      this.component = component;
      this.klass = this.constructor = component.klass;
      var method, func;
      for (method in component) {
        if (this[method]) continue;
        func = component[method];
        if (typeof func == 'function') func = forward(method);
        this[method] = func;
      }
    }
  });
   
  decorator.instanceMethod('extend', function(source) {
    this.component.extend(source);
    for (var method in source) {
      func = source[method];
      if (typeof func == 'function') func = forward(method);
      this[method] = func;
    }
  });
  
  while (arg = args.shift()) decorator.include(arg);
  return decorator;
};
