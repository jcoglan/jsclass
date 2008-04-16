if (JS.Proxy === undefined) JS.Proxy = {};

JS.Proxy.Virtual = function(klass) {
  
  var bridge = function() {}, self = arguments.callee;
  bridge.prototype = klass.prototype;
  
  var proxy = JS.Class(), func;
  
  for (var method in klass.prototype) {
    func = klass.prototype[method];
    if (Function.is(func) && func != klass) func = self.forward(method);
    proxy.instanceMethod(method, func);
  }
  
  proxy.include({
    initialize: function() {
      var args = arguments, subject = null;
      this._getSubject = function() {
        subject = new bridge;
        klass.apply(subject, args);
        return (this._getSubject = function() { return subject; })();
      };
    },
    klass: klass,
    constructor: klass
  });
  
  proxy.instanceMethod('extend', self.extend);
  
  return proxy;
};

JS.extend(JS.Proxy.Virtual, {
  forward: function(name) {
    return function() {
      var subject = this._getSubject();
      return subject[name].apply(subject, arguments);
    };
  },
  
  extend: function(source) {
    this._getSubject().extend(source);
    var method, func;
    for (method in source) {
      func = source[method];
      if (Function.is(func)) func = JS.Proxy.Virtual.forward(method);
      this[method] = func;
    }
  }
});
