JS.State = (function(Class) {
  
  var addStateMethods = function(state, klass) {
    for (var method in state)
      (function(methodName) {
        klass.instanceMethod(methodName, function() {
          var func = (this._state || {})[methodName];
          return func ? func.apply(this, arguments): this;
        }, false);
      })(method);
  };
  
  var buildStateCollection = function(collection, superStates, states) {
    var state, method;
    for (state in states) {
      collection[state] = collection[state] || {};
      for (method in states[state])
        Class.addMethod(collection[state], superStates[state], method, states[state][method]);
    }
  };
  
  Class.addMethod = (function(wrapped) {
    return function(object, superObject, name, func) {
      if (name != 'states' || typeof func != 'object') return wrapped.apply(Class, arguments);
      var collection = {}, superStates = superObject.states || {};
      buildStateCollection(collection, superStates, superStates);
      buildStateCollection(collection, superStates, func);
      return wrapped.call(Class, object, superObject, 'states', collection);
    };
  })(Class.addMethod);
  
  return JS.Module({
    _getState: function(state) {
      return  (typeof state == 'object' && state) ||
              (typeof state == 'string' && ((this.states || {})[state] || {})) ||
              {};
    },
    
    setState: function(state) {
      this._state = this._getState(state);
      addStateMethods(this._state, this.klass);
    },
    
    inState: function() {
      for (var i = 0, n = arguments.length; i < n; i++) {
        if (this._state == this._getState(arguments[i])) return true;
      }
      return false;
    }
  });
})(JS.Class);
