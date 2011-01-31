JS.Test.extend({
  Mocking: new JS.Module({
    extend: {
      ExpectationError: new JS.Class(JS.Test.Unit.AssertionFailedError),
      
      UnexpectedCallError: new JS.Class(Error, {
        initialize: function(message) {
          this.message = message.toString();
        }
      }),
      
      __activeStubs__: [],
      
      stub: function(object, methodName, implementation) {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) {
          if (stubs[i]._object === object && stubs[i]._methodName === methodName)
            return stubs[i].defaultMatcher(implementation);
        }
        
        var stub = new JS.Test.Mocking.Stub(object, methodName);
        stubs.push(stub);
        return stub.defaultMatcher(implementation);
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
        initialize: function(object, methodName) {
          this._object      = object;
          this._methodName  = methodName;
          this._original    = object[methodName];
          
          this._ownProperty = object.hasOwnProperty
                            ? object.hasOwnProperty(methodName)
                            : (typeof this._original !== 'undefined');
          
          var mocking = JS.Test.Mocking;
          
          this._argMatchers = [];
          this._anyArgs     = new mocking.Parameters([new mocking.AnyArgs()]);
          this._expected    = false;
          this._callsMade   = 0;
          
          this.apply();
        },
        
        defaultMatcher: function(implementation) {
          this._activeLastMatcher();
          this._currentMatcher = this._anyArgs;
          if (typeof implementation === 'function')
            this._currentMatcher._fake = implementation;
          return this;
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
          this._expected = true;
        },
        
        _activeLastMatcher: function() {
          if (this._currentMatcher) this._currentMatcher._active = true;
        },
        
        _dispatch: function(args) {
          this._activeLastMatcher();
          var matchers = this._argMatchers.concat(this._anyArgs),
              matcher, result;
          
          this._callsMade += 1;
          
          for (var i = 0, n = matchers.length; i < n; i++) {
            matcher = matchers[i];
            result  = matcher.match(args);
            
            if (!result) continue;
            
            if (typeof result === 'function')
              return result.apply(this._object, args);
            
            if (result === true)  return matcher.nextReturnValue();
            if (result.callback)  return result.callback.apply(result.context, matcher.nextYieldArgs());
            if (result.exception) throw result.exception;
          }
          
          throw new JS.Test.Mocking.UnexpectedCallError('dispatch fail');
        },
        
        _verify: function() {
          if (!this._expected) return;
          var parameters, message;
          
          for (var i = 0, n = this._argMatchers.length; i < n; i++) {
            parameters = this._argMatchers[i];
            if (parameters.verify()) continue;
            
            message = new JS.Test.Unit.AssertionMessage('Mock expectation not met',
                            '<?> expected to receive call\n' + this._methodName + '(?).',
                            [this._object, parameters.toArray()]);
            
            throw new JS.Test.Mocking.ExpectationError(message);
          }
          
          if (this._callsMade > 0) return;
          
          message = new JS.Test.Unit.AssertionMessage('Mock expectation not met',
                        '<?> expected to receive call\n' + this._methodName + '(?).',
                        [this._object, this._anyArgs.toArray()]);
          
          throw new JS.Test.Mocking.ExpectationError(message);
        }
      })
    }
  })
});

