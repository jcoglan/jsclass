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
        },
        
        apply: function() {
          var object = this._object, methodName = this._methodName;
          if (object[methodName] !== this._original) return;
          var self = this;
          object[methodName] = function() { return self._returnValue };
        },
        
        revoke: function() {
          if (this._ownProperty)
            this._object[this._methodName] = this._original;
          else
            delete this._object[this._methodName];
        },
        
        andReturn: function(returnValue) {
          this._returnValue = returnValue;
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

