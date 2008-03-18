JS.Decorator = function() {
  var args = Array.from(arguments), klass = args.shift(), arg;
  var decorator = JS.Class(), method, func, self = arguments.callee;
  
  for (method in klass.prototype) {
    func = klass.prototype[method];
    if (Function.is(func)) func = self.delegate(method);
    decorator.instanceMethod(method, func);
  }
   
  decorator.instanceMethod('initialize', self.initialize);
  decorator.instanceMethod('extend', self.extend);
  
  while (arg = args.shift()) decorator.include(arg);
  return decorator;
};

JS.extend(JS.Decorator, {
  delegate: function(name) {
    return function() {
      return this.component[name].apply(this.component, arguments);
    };
  },
  
  initialize: function(component) {
    this.component = component;
    this.klass = this.constructor = component.klass;
    var method, func;
    for (method in component) {
      if (this[method]) continue;
      func = component[method];
      if (Function.is(func)) func = JS.Decorator.delegate(method);
      this[method] = func;
    }
  },
  
  extend: function(source) {
    this.component.extend(source);
    var method, func;
    for (method in source) {
      func = source[method];
      if (Function.is(func)) func = JS.Decorator.delegate(method);
      this[method] = func;
    }
  }
});
