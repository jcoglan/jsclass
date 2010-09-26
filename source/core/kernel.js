JS.Kernel = new JS.Module('Kernel', {
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    this.__meta__ = new JS.Module(this, {_target: this});
    return this.__meta__.include(this.klass);
  },
  
  extend: function(module) {
    this.__eigen__().include(module);
    return this;
  }
});

