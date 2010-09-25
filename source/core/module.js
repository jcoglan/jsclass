JS.Module = JS.makeClass();

JS.extend(JS.Module.prototype, {
  initialize: function(name, methods, options) {
    if (typeof name !== 'string') {
      options = arguments[1];
      methods = arguments[0];
      name    = undefined;
    }
    options = options || {};
    this.__mod__ = this;
    this.__fns__ = {};
    this.__tgt__ = options._target;
    this.include(methods);
  },
  
  include: function(module) {
    if (!module) return;
    var field, method;
    for (field in module) {
      if (!module.hasOwnProperty(field)) continue;
      method = new JS.Method(this, field, module[field]);
      this.__fns__[field] = method;
      this.acceptMethod(method);
    }
  },
  
  acceptMethod: function(method) {
    if (!this.__tgt__) return;
    this.__tgt__[method.name] = method.callable;
  }
});

