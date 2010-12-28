JS.Test.extend({
  Mocking: new JS.Module({
    extend: {
      ExpectationError: new JS.Class(JS.Test.Unit.AssertionFailedError),
      
      __activeStubs__: [],
      
      stub: function(object, methodName, implementation) {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) {
          if (stubs[i]._object === object && stubs[i]._methodName === methodName) {
            if (typeof implementation === 'function')
              stubs[i]._fake = implementation;
            return stubs[i];
          }
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
          this._fake        = implementation;
          this._original    = object[methodName];
          this._ownProperty = object.hasOwnProperty(methodName);
          this._argMatchers = [];
          this._callsMade   = 0;
          
          this.apply();
        },
        
        apply: function() {
          var object = this._object, methodName = this._methodName;
          if (object[methodName] !== this._original) return;
          
          var self = this;
          object[methodName] = function() { return self._dispatch(arguments) };
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
          this._lastMatcher()._exception = exception;
          return this;
        },
        
        returns: function() {
          this._lastMatcher().returns(arguments);
          return this;
        },
        
        yields: function() {
          this._lastMatcher().yields(arguments);
          return this;
        },
        
        _lastMatcher: function() {
          var matchers = this._argMatchers;
          if (matchers.length === 0) matchers.push(new JS.Test.Mocking.Parameters([]));
          return matchers[matchers.length - 1];
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
          if (this._fake)
            return this._fake.apply(this._object, args);
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

