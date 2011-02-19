JS.Test.Unit.extend({
  /** section: test
   * mixin JS.Test.Unit.Assertions
   *
   * `JS.Test.Unit.Assertions` contains the standard `JS.Test.Unit` assertions.
   * `Assertions` is included in `JS.Test.Unit.TestCase`.
   * 
   * To include it in your own code and use its functionality, you simply
   * need to `catch` `JS.Test.Unit.AssertionFailedError`. Additionally you may
   * override `JS.Test.Unit.Assertions#addAssertion` to get notified whenever
   * an assertion is made.
   * 
   * Notes:
   * * The message to each assertion, if given, will be propagated with the
   *   failure.
   * * It is easy to add your own assertions based on `JS.Test.Unit.Assertions#assertBlock`.
   * 
   * Example custom assertion:
   * 
   *     deny: function(bool, message) {
   *         message = this.buildMessage(message, "<?> is not false or null.", bool);
   *         this.assertBlock(message, function() { return !bool });
   *     }
   **/
  Assertions: new JS.Module({
    /**
     * JS.Test.Unit.Assertions#assertBlock(message, block, context) -> undefined
     * 
     * The assertion upon which all other assertions are based. Passes if the
     * block yields `true`.
     **/
    assertBlock: function(message, block, context) {
      if (typeof message === 'function') {
        context = block;
        block   = message;
        message = null;
      }
      this.__wrapAssertion__(function() {
        if (!block.call(context || null)) {
          message = this.buildMessage(message || 'assertBlock failed.');
          throw new JS.Test.Unit.AssertionFailedError(message);
        }
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#flunk(message) -> undefined
     * 
     * Flunk always fails.
     **/
    flunk: function(message) {
      this.assertBlock(this.buildMessage(message || 'Flunked'), function() { return false });
    },
    
    /**
     * JS.Test.Unit.Assertions#assert(bool, message) -> undefined
     * 
     * Asserts that `bool` is not falsey.
     **/
    assert: function(bool, message) {
      this.__wrapAssertion__(function() {
        this.assertBlock(this.buildMessage(message, "<?> is not true.", bool),
                         function() { return bool });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertEqual(expected, actual, message) -> undefined
     * 
     * Passes if `expected == actual` or if `expected.equals(actual) == true`.
     * 
     * Note that the ordering of arguments is important, since a helpful
     * error message is generated when this one fails that tells you the
     * values of expected and actual.
     **/
    assertEqual: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected but was\n<?>.", expected, actual);
      this.assertBlock(fullMessage, function() {
        return JS.Enumerable.areEqual(expected, actual);
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNotEqual(expected, actual, message) -> undefined
     * 
     * Passes if `actual` is not equal to `expected`.
     **/
    assertNotEqual: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected not to be equal to\n<?>.",
                                                   expected,
                                                   actual);
      this.assertBlock(fullMessage, function() {
        return !JS.Enumerable.areEqual(expected, actual);
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNull(object, message) -> undefined
     * 
     * Passes if `object` is `null`.
     **/
    assertNull: function(object, message) {
      this.assertEqual(null, object, message);
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNotNull(object, message) -> undefined
     * 
     * Passes if `object` is not `null`.
     **/
    assertNotNull: function(object, message) {
      var fullMessage = this.buildMessage(message, "<?> expected not to be null.", object);
      this.assertBlock(fullMessage, function() { return object !== null });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertKindOf(klass, object, message) -> undefined
     * 
     * Passes if `object` is a kind of `klass`.
     **/
    assertKindOf: function(klass, object, message) {
      this.__wrapAssertion__(function() {
        var type = (!object || typeof klass === 'string') ? typeof object : (object.klass || object.constructor);
        var fullMessage = this.buildMessage(message, "<?> expected to be an instance of\n" +
                                                     "<?> but was\n" +
                                                     "<?>.",
                                                     object, klass, type);
        this.assertBlock(fullMessage, function() { return JS.isType(object, klass) });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertRespondTo(object, method, message) -> undefined
     * 
     * Passes if `object` responds to `method`.
     **/
    assertRespondTo: function(object, method, message) {
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage('', "<?>\ngiven as the method name argument to #assertRespondTo must be a String.", method);
        
        this.assertBlock(fullMessage, function() { return typeof method === 'string' });
        
        var type = object ? object.constructor : typeof object;
        fullMessage = this.buildMessage(message, "<?>\n" +
                                                 "of type <?>\n" +
                                                 "expected to respond to <?>.",
                                                 object,
                                                 type,
                                                 method);
        this.assertBlock(fullMessage, function() { return object && object[method] !== undefined });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertMatch(pattern, string, message) -> undefined
     * 
     * Passes if `string` matches `pattern`.
     **/
    assertMatch: function(pattern, string, message) {
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage(message, "<?> expected to match\n<?>.", string, pattern);
        this.assertBlock(fullMessage, function() {
          return JS.match(pattern, string);
        });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNoMatch(pattern, string, message) -> undefined
     * 
     * Passes if `string` does not match `pattern`.
     **/
    assertNoMatch: function(pattern, string, message) {
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage(message, "<?> expected not to match\n<?>.", string, pattern);
        this.assertBlock(fullMessage, function() {
          return (typeof pattern.test === 'function')
               ? !pattern.test(string)
               : !pattern.match(string);
        });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertSame(expected, actual, message) -> undefined
     * 
     * Passes if `actual` and `expected` are the same object.
     **/
    assertSame: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected to be the same as\n" +
                                                   "<?>.",
                                                   expected, actual);
      this.assertBlock(fullMessage, function() { return actual === expected });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNotSame(expected, actual, message) -> undefined
     * 
     * Passes if `actual` and `expected` are not the same object.
     **/
    assertNotSame: function(expected, actual, message) {
      var fullMessage = this.buildMessage(message, "<?> expected not to be the same as\n" +
                                                   "<?>.",
                                                   expected, actual);
      this.assertBlock(fullMessage, function() { return actual !== expected });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertInDelta(expected, actual, delta, message) -> undefined
     * 
     * Passes if `expected` and `actual` are equal
     * within `delta` tolerance.
     **/
    assertInDelta: function(expected, actual, delta, message) {
      this.__wrapAssertion__(function() {
        this.assertKindOf('number', expected);
        this.assertKindOf('number', actual);
        this.assertKindOf('number', delta);
        this.assert(delta >= 0, "The delta should not be negative");
        
        var fullMessage = this.buildMessage(message, "<?> and\n" +
                                                     "<?> expected to be within\n" +
                                                     "<?> of each other.",
                                                     expected,
                                                     actual,
                                                     delta);
        this.assertBlock(fullMessage, function() {
          return Math.abs(expected - actual) <= delta;
        });
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#assertSend(sendArray, message) -> undefined
     * 
     * Passes if the method send returns a truthy value.
     * 
     * `sendArray` is composed of:
     * * A receiver
     * * A method
     * * Arguments to the method
     **/
    assertSend: function(sendArray, message) {
      this.__wrapAssertion__(function() {
        this.assertKindOf(Array, sendArray, "assertSend requires an array of send information");
        this.assert(sendArray.length >= 2, "assertSend requires at least a receiver and a message name");
        var fullMessage = this.buildMessage(message, "<?> expected to respond to\n" +
                                                     "<?(?)> with a true value.",
                                                     sendArray[0],
                                                     JS.Test.Unit.AssertionMessage.literal(sendArray[1]),
                                                     sendArray.slice(2));
        this.assertBlock(fullMessage, function() {
          return sendArray[0][sendArray[1]].apply(sendArray[0], sendArray.slice(2));
        });
      });
    },
    
    __processExceptionArgs__: function(args) {
      var args     = JS.array(args),
          context  = (typeof args[args.length - 1] === 'function') ? null : args.pop(),
          block    = args.pop(),
          message  = JS.isType(args[args.length - 1], 'string') ? args.pop() : '',
          expected = new JS.Enumerable.Collection(args);
      
      return [args, expected, message, block, context];
    },
    
    /**
     * JS.Test.Unit.Assertions#assertThrow(args, message, block, context) -> undefined
     * 
     * Passes if the block throws one of the given exception types.
     **/
    assertThrow: function() {
      var A        = this.__processExceptionArgs__(arguments),
          args     = A[0],
          expected = A[1],
          message  = A[2],
          block    = A[3],
          context  = A[4];
      
      this.__wrapAssertion__(function() {
        var fullMessage = this.buildMessage(message, "<?> exception expected but none was thrown.", args),
            actualException;
        
        this.assertBlock(fullMessage, function() {
          try {
            block.call(context);
          } catch (e) {
            actualException = e;
            return true;
          }
          return false;
        });
        
        fullMessage = this.buildMessage(message, "<?> exception expected but was\n?", args, actualException);
        this.assertBlock(fullMessage, function() {
          return expected.any(function(type) {
            return JS.isType(actualException, type) || (actualException.name &&
                                                        actualException.name === type.name);
          });
        });
      });
    },
    
    /** alias of: JS.Test.Unit.Assertions#assertThrow
     * JS.Test.Unit.Assertions#assertThrows(args, message, block, context) -> undefined
     **/
    assertThrows: function() {
      return this.assertThrow.apply(this, arguments);
    },
    
    /**
     * JS.Test.Unit.Assertions#assertNothingThrown(args, message, block, context) -> undefined
     * 
     * Passes if the block does not throw an exception.
     **/
    assertNothingThrown: function() {
      var A        = this.__processExceptionArgs__(arguments),
          args     = A[0],
          expected = A[1],
          message  = A[2],
          block    = A[3],
          context  = A[4];
      
      this.__wrapAssertion__(function() {
        try {
          block.call(context);
        } catch (e) {
          if ((args.length === 0 && !JS.isType(e, JS.Test.Unit.AssertionFailedError)) ||
              expected.any(function(type) { return JS.isType(e, type) }))
            this.assertBlock(this.buildMessage(message, "Exception thrown:\n?", e), function() { return false });
          else
            throw e;
        }
      });
    },
    
    /**
     * JS.Test.Unit.Assertions#buildMessage(head, template, args) -> JS.Test.Unit.Assertions.AssertionMessage
     * 
     * Builds a failure message.  `head` is added before the `template` and
     * `args` replaces the `?`s positionally in the template.
     **/
    buildMessage: function() {
      var args     = JS.array(arguments),
          head     = args.shift(),
          template = args.shift();
      return new JS.Test.Unit.AssertionMessage(head, template, args);
    },
    
    __wrapAssertion__: function(block) {
      if (this.__assertionWrapped__ === undefined) this.__assertionWrapped__ = false;
      if (!this.__assertionWrapped__) {
        this.__assertionWrapped__ = true;
        try {
          this.addAssertion();
          return block.call(this);
        } finally {
          this.__assertionWrapped__ = false;
        }
      } else {
        return block.call(this);
      }
    },
    
    /**
     * JS.Test.Unit.Assertions#addAssertion() -> undefined
     * 
     * Called whenever an assertion is made.  Define this in classes that
     * include `JS.Test.Unit.Assertions` to record assertion counts.
     **/
    addAssertion: function() {}
  })
});

