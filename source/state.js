JS.State =  JS.Module({
  _getState: function(state) {
    return  (typeof state == 'object' && state) ||
            (typeof state == 'string' && ((this.states || {})[state] || {})) ||
            {};
  },
  
  setState: function(state) {
    this._state = this._getState(state);
    JS.util.State.addMethods(this._state, this.klass);
  },
  
  inState: function() {
    for (var i = 0, n = arguments.length; i < n; i++) {
      if (this._state == this._getState(arguments[i])) return true;
    }
    return false;
  }
});

JS.util.State = {
  stub: function() { return this; },
  
  buildStubs: function(stubs, collection, states) {
    var state, method;
    for (state in states) {
      collection[state] = {};
      for (method in states[state]) stubs[method] = this.stub;
  } },
  
  buildCollection: function(addMethod, proto, superproto, states) {
    var stubs = {}, collection = {}, superstates = superproto.states || {};
    this.buildStubs(stubs, collection, states);
    this.buildStubs(stubs, collection, superstates);
    var state, klass;
    for (state in collection) {
      klass = (superstates[state]||{}).klass;
      klass = klass ? JS.Class(klass, states[state]) : JS.Class(states[state]);
      klass.include(stubs, false);
      collection[state] = new klass;
    }
    return addMethod.call(JS.Class, proto, superproto, 'states', collection);
  },
  
  addMethods: function(state, klass) {
    for (var method in state) this.addMethod(klass, method);
  },
  
  addMethod: function(klass, method) {
    klass.instanceMethod(method, function() {
      var func = (this._state || {})[method];
      return func ? func.apply(this, arguments): this;
    }, false);
  }
};

JS.Class.addMethod = (function(wrapped) {
  return function(object, superObject, name, block) {
    if (name != 'states' || typeof block != 'object') return wrapped.apply(JS.Class, arguments);
    return JS.util.State.buildCollection(wrapped, object, superObject, block);
  };
})(JS.Class.addMethod);
