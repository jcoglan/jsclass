JS.Test.extend({
  Mocking: new JS.Module({
    extend: {
      ExpectationError: new JS.Class(JS.Test.Unit.AssertionFailedError),
      
      __activeStubs__: [],
      
      stub: function(object, methodName, implementation) {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) {
          if (stubs[i]._object === object && stubs[i]._methodName === methodName)
            return stubs[i];
        }
        
        var stub = new JS.Test.Mocking.Stub(object, methodName, implementation);
        stubs.push(stub);
        return stub;
      },
      
      removeStubs: function() {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) stubs[i].revoke();
        this.__activeStubs__ = [];
      },
      
      verify: function() {
        try {
          var stubs = this.__activeStubs__;
          for (var i = 0, n = stubs.length; i < n; i++)
            stubs[i]._verify();
        } finally {
          this.removeStubs();
        }
      },
      
      Stub: new JS.Class({
        initialize: function(object, methodName, implementation) {
          this._object      = object;
          this._methodName  = methodName;
          this._callable    = implementation;
          this._original    = object[methodName];
          this._ownProperty = object.hasOwnProperty(methodName);
          this._argMatchers = [new JS.Test.Mocking.Parameters(this, [])];
          this._callsMade   = 0;
          
          this.apply();
        },
        
        apply: function() {
          var object = this._object, methodName = this._methodName;
          if (object[methodName] !== this._original) return;
          
          var self = this;
          object[methodName] = this._callable ||
                               function() { return self._dispatch(arguments) };
        },
        
        revoke: function() {
          if (this._ownProperty)
            this._object[this._methodName] = this._original;
          else
            delete this._object[this._methodName];
        },
        
        expected: function() {
          if (this.hasOwnProperty('_minCalls')) return;
          this._minCalls = 1;
        },
        
        given: function() {
          var matcher = new JS.Test.Mocking.Parameters(arguments);
          this._argMatchers.push(matcher);
          return this;
        },
        
        raises: function(exception) {
          var matchers = this._argMatchers;
          matchers[matchers.length - 1]._exception = exception;
          return this;
        },
        
        returns: function() {
          var matchers = this._argMatchers;
          matchers[matchers.length - 1].returns(arguments);
          return this;
        },
        
        yields: function() {
          var matchers = this._argMatchers;
          matchers[matchers.length - 1].yields(arguments);
          return this;
        },
        
        _dispatch: function(args) {
          var matchers = this._argMatchers,
              matcher, result;
          
          this._callsMade += 1;
          
          for (var i = 0, n = matchers.length; i < n; i++) {
            matcher = matchers[i];
            result  = matcher.match(args);
            
            if (!result) continue;
            
            if (result === true)  return matcher.nextReturnValue();
            if (result.callback)  return result.callback.apply(result.context, matcher.nextYieldArgs());
            if (result.exception) throw result.exception;
          }
        },
        
        _verify: function() {
          if (typeof this._minCalls !== 'number') return;
          if (this._callsMade >= this._minCalls) return;
          
          var message = new JS.Test.Unit.AssertionMessage('Mock expectation not met',
                            '<?> expected to receive call\n' + this._methodName + '().',
                            [this._object]);
          
          throw new JS.Test.Mocking.ExpectationError(message);
        }
      })
    }
  })
});

