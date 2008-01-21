JS.Decorator = function() {
  var args = Array.from(arguments), klass = args.shift(), arg;
  var decorator = JS.Class(), method, func;
  
  var delegate = function(name) {
    return function() {
      return this.component[name].apply(this.component, arguments);
    };
  };
  
  for (method in klass.prototype) {
    func = klass.prototype[method];
    if (typeof func == 'function') func = delegate(method);
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
        if (typeof func == 'function') func = delegate(method);
        this[method] = func;
      }
    }
  });
   
  decorator.instanceMethod('extend', function(source) {
    this.component.extend(source);
    var method, func;
    for (method in source) {
      func = source[method];
      if (typeof func == 'function') func = delegate(method);
      this[method] = func;
    }
  });
  
  while (arg = args.shift()) decorator.include(arg);
  return decorator;
};
