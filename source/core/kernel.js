JS.Kernel = new JS.Module('Kernel', {
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    this.__meta__ = new JS.Module(this, {_target: this});
    return this.__meta__.include(this.klass);
  },
  
  extend: function(module) {
    this.__eigen__().include(module);
    return this;
  },
  
  method: function(name) {
    var cache = this.__mct__ = this.__mct__ || {},
        value = cache[name],
        field = this[name];
    
    if (typeof field !== 'function') return field;
    if (value && field === value._value) return value._bound;
    
    var bound = JS.bind(field, this);
    cache[name] = {_value: field, _bound: bound};
    return bound;
   }
});

