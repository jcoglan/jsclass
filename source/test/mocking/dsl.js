JS.Test.extend({
  Mocking: new JS.Module({
    extend: {
      __activeStubs__: [],
      
      findStub: function(object, methodName) {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) {
          if (stubs[i]._object === object && stubs[i]._methodName === methodName)
            return stubs[i];
        }
        
        var stub = new JS.Test.Mocking.Stub(object, methodName);
        stubs.push(stub);
        return stub;
      },
      
      removeStubs: function() {
        var stubs = this.__activeStubs__,
            i     = stubs.length;
        
        while (i--) stubs[i].revoke();
        this.__activeStubs__ = [];
      },
      
      Stub: new JS.Class({
        initialize: function(object, methodName) {
          this._object      = object;
          this._methodName  = methodName;
          this._original    = object[methodName];
          this._ownProperty = object.hasOwnProperty(methodName);
          this._argMatchers = [new JS.Test.Mocking.Parameters(this, [])];
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
        
        given: function() {
          var matcher = new JS.Test.Mocking.Parameters(this, arguments);
          this._argMatchers.push(matcher);
          return this;
        },
        
        returns: function(returnValue) {
          var matchers = this._argMatchers;
          matchers[matchers.length - 1]._returnValue = returnValue;
        },
        
        _dispatch: function(args) {
          var matchers = this._argMatchers, matcher;
          for (var i = 0, n = matchers.length; i < n; i++) {
            matcher = matchers[i];
            if (matcher.match(args)) return matcher._returnValue;
          }
        }
      }),
      
      Parameters: new JS.Class({
        initialize: function(stub, params) {
          this._stub   = stub;
          this._params = params;
        },
        
        match: function(args) {
          if (args.length === 0 && this._params.length === 0) return true;
          return JS.Enumerable.areEqual(this._params, args);
        }
      }),
      
      DSL: new JS.Module({
        stub: function(object, methodName) {
          var stub = JS.Test.Mocking.findStub(object, methodName);
          stub.apply();
          return stub;
        }
      })
    }
  })
});

JS.Test.Unit.TestCase.include(JS.Test.Mocking.DSL);
JS.Test.Unit.mocking = JS.Test.Mocking;

