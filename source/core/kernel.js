JS.Kernel = new JS.Module({
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    var module = this.__meta__ = new JS.Module({}, {_resolve: this});
    module.include(this.klass.__mod__);
    return module;
  },
  
  extend: function(module, resolve) {
    return this.__eigen__().include(module, {_extended: this}, resolve !== false);
  },
  
  isA: function(moduleOrClass) {
    return this.__eigen__().includes(moduleOrClass);
  },
  
  method: function(name) {
    var self = this, cache = self.__mcache__ = self.__mcache__ || {};
    if ((cache[name] || {}).fn === self[name]) return cache[name].bd;
    return (cache[name] = {fn: self[name], bd: JS.bind(self[name], self)}).bd;
  },
  
  tap: function(block, scope) {
    block.call(scope || null, this);
    return this;
  }
});

