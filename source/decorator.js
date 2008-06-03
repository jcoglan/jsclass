JS.Decorator = new JS.Class({
  initialize: function(decoree, methods) {
    var decorator = new JS.Class(), method, func,
        delegators = {};
    
    for (method in decoree.prototype) {
      func = decoree.prototype[method];
      if (JS.util.isFn(func) && func != decoree) func = this.klass.delegate(method);
      delegators[method] = func;
    }
    
    decorator.include(new JS.Module(delegators));
    decorator.include(this.klass.InstanceMethods);
    decorator.include(methods);
    return decorator;
  },
  
  extend: {
    delegate: function(name) {
      return function() {
        return this.component[name].apply(this.component, arguments);
      };
    },
    
    InstanceMethods: new JS.Module({
      initialize: function(component) {
        this.component = component;
        this.klass = this.constructor = component.klass;
        var method, func;
        for (method in component) {
          if (this[method]) continue;
          func = component[method];
          if (JS.util.isFn(func)) func = JS.Decorator.delegate(method);
          this[method] = func;
        }
      },
      
      extend: function(source) {
        this.component.extend(source);
        var method, func;
        for (method in source) {
          func = source[method];
          if (JS.util.isFn(func)) func = JS.Decorator.delegate(method);
          this[method] = func;
        }
      }
    })
  }
});
