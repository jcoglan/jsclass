JS.Method = JS.makeClass();

JS.extend(JS.Method.prototype, {
  initialize: function(module, name, callable) {
    this.module   = module;
    this.name     = name;
    this.callable = callable;
  },
  
  call: function() {
    return this.callable.call.apply(this.callable, arguments);
  }
});

JS.Method.create = function(module, name, callable) {
  return (callable instanceof this)
       ? callable
       : new this(module, name, callable);
};

