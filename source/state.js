JS.State = new JS.Module('State', {
  __getState__: function(state) {
    return  (typeof state === 'object' && state) ||
            (typeof state === 'string' && ((this.states || {})[state] || {})) ||
            {};
  },
  
  setState: function(state) {
    this.__state__ = this.__getState__(state);
    JS.State.addMethods(this.__state__, this.klass);
  },
  
  inState: function() {
    var i = arguments.length;
    while (i--) {
      if (this.__state__ === this.__getState__(arguments[i])) return true;
    }
    return false;
  },
  
  extend: {
    stub: function() { return this; },
    
    buildStubs: function(stubs, collection, states) {
      var state, method;
      for (state in states) {
        collection[state] = {};
        for (method in states[state]) stubs[method] = this.stub;
    } },
    
    buildCollection: function(module, states) {
      var stubs       = {},
          collection  = {},
          superstates = module.lookup('states').pop() || {},
          state, klass, methods, name;
      
      this.buildStubs(stubs, collection, states);
      this.buildStubs(stubs, collection, superstates);
      
      for (state in collection) {
        klass = (superstates[state]||{}).klass;
        klass = klass ? new JS.Class(klass, states[state]) : new JS.Class(states[state]);
        methods = {};
        for (name in stubs) { if (!klass.prototype[name]) methods[name] = stubs[name]; }
        klass.include(methods, false);
        collection[state] = new klass;
      }
      if (module.__res__) this.addMethods(stubs, module.__res__.klass);
      return collection;
    },
    
    addMethods: function(state, klass) {
      if (!klass) return;
      
      var methods = {},
          p       = klass.prototype,
          method;
      
      for (method in state) {
        if (p[method]) continue;
        p[method] = klass.__mod__.__fns__[method] = this.wrapped(method);
      }
    },
    
    wrapped: function(method) {
      return function() {
        var func = (this.__state__ || {})[method];
        return func ? func.apply(this, arguments): this;
      };
    }
  }
});

JS.Module.include({define: (function(wrapped) {
  return function(name, block) {
    if (name === 'states' && typeof block === 'object')
      arguments[1] = JS.State.buildCollection(this, block);
    return wrapped.apply(this, arguments);
  };
})(JS.Module.prototype.define)}, true);
