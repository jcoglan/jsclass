JS.Test.Mocking.extend({
  Parameters: new JS.Class({
    initialize: function(params, expected) {
      this._params    = JS.array(params);
      this._expected  = expected;
      this._active    = false;
      this._callsMade = 0;
    },
    
    toArray: function() {
      var array = this._params.slice();
      if (this._yieldArgs) array.push(new JS.Test.Mocking.InstanceOf(Function));
      return array;
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
    
    setMinimum: function(n) {
      this._expected = true;
      this._minimumCalls = n;
    },
    
    setMaximum: function(n) {
      this._expected = true;
      this._maximumCalls = n;
    },
    
    setExpected: function(n) {
      this._expected = true;
      this._expectedCalls = n;
    },
    
    match: function(args) {
      if (!this._active) return false;
      
      var argsCopy = JS.array(args), callback, context;
      
      if (this._yieldArgs) {
        if (typeof argsCopy[argsCopy.length - 2] === 'function') {
          context  = argsCopy.pop();
          callback = argsCopy.pop();
        } else if (typeof argsCopy[argsCopy.length - 1] === 'function') {
          context  = null;
          callback = argsCopy.pop();
        }
      }
      
      if (!JS.Enumerable.areEqual(this._params, argsCopy)) return false;
      
      if (this._exception)  return {exception: this._exception};
      if (this._yieldArgs)  return {callback: callback, context: context};
      if (this._fake)       return this._fake;
      else                  return true;
    },
    
    ping: function() {
      this._callsMade += 1;
    },
    
    verify: function(object, methodName) {
      if (!this._expected) return;
      
      var okay = true, extraMessage;
      
      if (this._callsMade === 0 && !this._maximumCalls) {
        okay = false;
      } else if (this._expectedCalls && this._callsMade !== this._expectedCalls) {
        extraMessage = this._createMessage('exactly');
        okay = false;
      } else if (this._maximumCalls && this._callsMade > this._maximumCalls) {
        extraMessage = this._createMessage('at most');
        okay = false;
      } else if (this._minimumCalls && this._callsMade < this._minimumCalls) {
        extraMessage = this._createMessage('at least');
        okay = false;
      }
      if (okay) return;
      
      var message = new JS.Test.Unit.AssertionMessage('Mock expectation not met',
                        '<?> expected to receive call\n' + methodName + '(?)' +
                        (extraMessage ? '\n' + extraMessage : '') + '.',
                        [object, this.toArray()]);
      
      throw new JS.Test.Mocking.ExpectationError(message);
    },
    
    _createMessage: function(type) {
      var actual = this._callsMade,
          report = 'but ' + actual + ' call' + (actual === 1 ? ' was' : 's were') + ' made';
      
      var copy = {
        'exactly':   this._expectedCalls,
        'at most':   this._maximumCalls,
        'at least':  this._minimumCalls
      };
      return type + ' ' + copy[type] + ' times\n' + report;
    }
  })
});

