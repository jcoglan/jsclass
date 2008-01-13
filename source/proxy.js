if (JS.Proxy === undefined) JS.Proxy = {};

JS.Proxy.Virtual = function(klass) {
  
  var bridge = function() {};
  bridge.prototype = klass.prototype;
  
  var proxy = JS.Class(), func;
  
  var forward = function(name) {
    return function() {
      var subject = this._getSubject();
      return subject[name].apply(subject, arguments);
    };
  };
  
  for (var method in klass.prototype) {
    func = klass.prototype[method];
    if (typeof func == 'function') func = forward(method);
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
   
  proxy.instanceMethod('extend', function(source) {
    var subject = this._getSubject();
    subject.extend(source);
    for (var method in source) {
      func = source[method];
      if (typeof func == 'function') func = forward(method);
      this[method] = func;
    }
  });
  
  return proxy;
};
