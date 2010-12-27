JS.Test.Mocking.extend({
  Parameters: new JS.Class({
    initialize: function(params) {
      this._params = JS.array(params);
    },
    
    returns: function(returnValues) {
      this._returnIndex = 0;
      this._returnValues = returnValues;
    },
    
    nextReturnValue: function() {
      if (!this._returnValues) return undefined;
      var value = this._returnValues[this._returnIndex];
      this._returnIndex = (this._returnIndex + 1) % this._returnValues.length;
      return value;
    },
    
    yields: function(yieldValues) {
      this._yieldIndex = 0;
      this._yieldArgs = yieldValues;
    },
    
    nextYieldArgs: function() {
      if (!this._yieldArgs) return undefined;
      var value = this._yieldArgs[this._yieldIndex];
      this._yieldIndex = (this._yieldIndex + 1) % this._yieldArgs.length;
      return value;
    },
    
    match: function(args) {
      var argsCopy = JS.array(args), callback, context;
      
      if (this._yieldArgs) {
        if (JS.isFn(argsCopy[argsCopy.length - 2])) {
          context  = argsCopy.pop();
          callback = argsCopy.pop();
        } else if (JS.isFn(argsCopy[argsCopy.length - 1])) {
          context  = null;
          callback = argsCopy.pop();
        }
      }
      
      if (!JS.Enumerable.areEqual(this._params, argsCopy)) return false;
      
      if (this._exception) return {exception: this._exception};
      if (this._yieldArgs) return {callback: callback, context: context};
      else                 return true;
    }
  })
});

