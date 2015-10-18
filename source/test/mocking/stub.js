Test.extend({
  Mocking: new JS.Module({
    extend: {
      ExpectationError: new JS.Class(Test.Unit.AssertionFailedError),

      UnexpectedCallError: new JS.Class(Error, {
        initialize: function(message) {
          this.message = message.toString();
        }
      }),

      __activeStubs__: [],

      stub: function(object, methodName, implementation) {
        var constructor = false, stub;

        if (object === 'new') {
          object         = methodName;
          methodName     = implementation;
          implementation = undefined;
          constructor    = true;
        }
        if (JS.isType(object, 'string')) {
          implementation = methodName;
          methodName     = object;
          object         = JS.ENV;
        }

        var stubs = this.__activeStubs__,
            i     = stubs.length;

        while (i--) {
          if (stubs[i]._object === object && stubs[i]._methodName === methodName) {
            stub = stubs[i];
            break;
          }
        }

        if (!stub) stub = new Test.Mocking.Stub(object, methodName);
        stubs.push(stub);
        return stub.createMatcher(implementation, constructor);
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
          this._object     = object;
          this._methodName = methodName;
          this._original   = object[methodName];
          this._matchers   = [];

          this._ownProperty = object.hasOwnProperty
                            ? object.hasOwnProperty(methodName)
                            : (typeof this._original !== 'undefined');

          this.activate();
        },

        createMatcher: function(implementation, constructor) {
          if (implementation !== undefined && typeof implementation !== 'function') {
            this._object[this._methodName] = implementation;
            return null;
          }

          var mocking = Test.Mocking,
              matcher = new mocking.Parameters([new mocking.AnyArgs()], constructor, implementation);

          this._matchers.push(matcher);
          return matcher;
        },

        activate: function() {
          var object = this._object, methodName = this._methodName;
          if (object[methodName] !== this._original) return;

          var self = this;

          var shim = function() {
            var isConstructor = (this instanceof shim);
            return self._dispatch(this, arguments, isConstructor);
          };
          object[methodName] = shim;
        },

        revoke: function() {
          if (this._ownProperty) {
            this._object[this._methodName] = this._original;
          } else {
            try {
              delete this._object[this._methodName];
            } catch (e) {
              this._object[this._methodName] = undefined;
            }
          }
        },

        _dispatch: function(receiver, args, isConstructor) {
          var matchers = this._matchers,
              eligible = [],
              matcher, result;

          for (var i = 0, n = matchers.length; i < n; i++) {
            matcher = matchers[i];
            result  = matcher.match(receiver, args, isConstructor);
            if (!result) continue;
            matcher.ping();
            eligible.push([matcher, result]);
          }

          if (eligible.length === 0)
            this._throwUnexpectedCall(receiver, args, isConstructor);

          eligible = eligible.pop();
          matcher  = eligible[0];
          result   = eligible[1];

          if (result.fake) return result.fake.apply(receiver, args);

          if (result.exception) throw result.exception;

          if (result.hasOwnProperty('callback')) {
            if (!result.callback) this._throwUnexpectedCall(receiver, args, isConstructor);
            result.callback.apply(result.context, matcher.nextYieldArgs());
          }

          if (result) return matcher.nextReturnValue();
        },

        _throwUnexpectedCall: function(receiver, args, isConstructor) {
          var message;
          if (isConstructor) {
            message = new Test.Unit.AssertionMessage('',
                          '<?> unexpectedly constructed with arguments:\n(?)',
                          [this._original, JS.array(args)]);
          } else {
            message = new Test.Unit.AssertionMessage('',
                          '<?> unexpectedly received call to ' + this._methodName + '() with arguments:\n(?)',
                          [receiver, JS.array(args)]);
          }
          throw new Test.Mocking.UnexpectedCallError(message);
        },

        _verify: function() {
          for (var i = 0, n = this._matchers.length; i < n; i++)
            this._matchers[i].verify(this._object, this._methodName, this._original);
        }
      })
    }
  })
});

