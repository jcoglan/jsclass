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

        if (!stub) stub = new Test.Mocking.Stub(object, methodName, constructor);
        stubs.push(stub);
        return stub.createMatcher(implementation);
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
        initialize: function(object, methodName, constructor) {
          this._object      = object;
          this._methodName  = methodName;
          this._constructor = constructor;
          this._original    = object[methodName];
          this._matchers    = [];

          this._ownProperty = object.hasOwnProperty
                            ? object.hasOwnProperty(methodName)
                            : (typeof this._original !== 'undefined');

          this.activate();
        },

        createMatcher: function(implementation) {
          if (implementation !== undefined && typeof implementation !== 'function') {
            this._object[this._methodName] = implementation;
            return null;
          }

          var mocking = JS.Test.Mocking,
              matcher = new mocking.Parameters([new mocking.AnyArgs()], implementation);

          this._matchers.push(matcher);
          return matcher;
        },

        activate: function() {
          var object = this._object, methodName = this._methodName;
          if (object[methodName] !== this._original) return;

          var self = this;
          this._shim = function() { return self._dispatch(this, arguments) };
          object[methodName] = this._shim;
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

        _dispatch: function(receiver, args) {
          var matchers = this._matchers,
              matcher, result, message;

          if (this._constructor && !(receiver instanceof this._shim)) {
            message = new Test.Unit.AssertionMessage('',
                          '<?> expected to be a constructor but called without `new`',
                          [this._original]);

            throw new Test.Mocking.UnexpectedCallError(message);
          }
          if (!this._constructor && (receiver instanceof this._shim)) {
            message = new Test.Unit.AssertionMessage('',
                          '<?> expected not to be a constructor but called with `new`',
                          [this._original]);

            throw new Test.Mocking.UnexpectedCallError(message);
          }

          for (var i = 0, n = matchers.length; i < n; i++) {
            matcher = matchers[i];
            result  = matcher.match(args);

            if (!result) continue;
            matcher.ping();

            if (result.fake)
              return result.fake.apply(receiver, args);

            if (result.exception) throw result.exception;

            if (result.hasOwnProperty('callback')) {
              if (!result.callback) continue;
              result.callback.apply(result.context, matcher.nextYieldArgs());
            }

            if (result) return matcher.nextReturnValue();
          }

          if (this._constructor) {
            message = new Test.Unit.AssertionMessage('',
                          '<?> constructed with unexpected arguments:\n(?)',
                          [this._original, JS.array(args)]);
          } else {
            message = new Test.Unit.AssertionMessage('',
                          '<?> received call to ' + this._methodName + '() with unexpected arguments:\n(?)',
                          [receiver, JS.array(args)]);
          }

          throw new Test.Mocking.UnexpectedCallError(message);
        },

        _verify: function() {
          for (var i = 0, n = this._matchers.length; i < n; i++)
            this._verifyParameters(this._matchers[i]);
        },

        _verifyParameters: function(parameters) {
          var object = this._constructor ? this._original : this._object;
          parameters.verify(object, this._methodName, this._constructor);
        }
      })
    }
  })
});

