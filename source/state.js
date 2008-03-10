JS.State = (function() {
  
  var addStateMethods = function(state, klass) {
    for (var method in state)
      (function(methodName) {
        klass.instanceMethod(methodName, function() {
          var func = (this._state || {})[methodName];
          return func ? func.apply(this, arguments): this;
        }, false);
      })(method);
  };
  
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
})();
