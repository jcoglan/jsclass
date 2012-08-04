JS.Test.Unit.extend({
  TestCase: new JS.Class({
    include: JS.Test.Unit.Assertions,
    
    extend: [JS.Enumerable, {
      testCases: [],
      reports:   [],
      handlers:  [],
      
      clear: function() {
        this.testCases = [];
      },
      
      inherited: function(klass) {
        this.testCases.push(klass);
      },
      
      forEach: function(block, context) {
        for (var i = 0, n = this.testCases.length; i < n; i++)
          block.call(context || null, this.testCases[i]);
      },
      
      STARTED:  'Test.Unit.TestCase.STARTED',
      FINISHED: 'Test.Unit.TestCase.FINISHED',
      
      suite: function(filter, inherit, useDefault) {
        var methodNames = new JS.Enumerable.Collection(this.instanceMethods(inherit)),
            tests = methodNames.select(function(name) { return this.filter(name, filter) }, this).sort(),
            suite = new JS.Test.Unit.TestSuite(this.displayName);
        
        for (var i = 0, n = tests.length; i < n; i++) {
          try { suite.push(new this(tests[i])) } catch (e) {}
        }
        if (suite.empty() && useDefault) {
          try { suite.push(new this('defaultTest')) } catch (e) {}
        }
        return suite;
      },
      
      filter: function(name, filter) {
        if (!/^test./.test(name)) return false;
        if (!filter || filter.length === 0) return true;
        
        var n = filter.length;
        while (n--) {
          if (name.substr(6, filter[n].length) === filter[n])
            return true;
        }
        return false;
      }
    }],
    
    initialize: function(testMethodName) {
      if (typeof this[testMethodName] !== 'function') throw 'invalid_test';
      this._methodName = testMethodName;
      this._testPassed = true;
    },
    
    run: function(result, continuation, callback, context) {
      callback.call(context || null, this.klass.STARTED, this);
      this._result = result;
      
      var teardown = function() {
        this.exec('teardown', function() {
          this.exec(function() { JS.Test.Unit.mocking.verify() }, function() {
            result.addRun();
            callback.call(context || null, this.klass.FINISHED, this);
            continuation();
          });
        });
      };
      
      this.exec('setup', function() {
        this.exec(this._methodName, teardown);
      }, teardown);
    },
    
    exec: function(methodName, onSuccess, onError) {
      if (!methodName) return onSuccess.call(this);
      
      if (!onError) onError = onSuccess;
      
      var arity = (typeof methodName === 'function')
                ? methodName.length
                : this.__eigen__().instanceMethod(methodName).arity,
          
          callable = (typeof methodName === 'function') ? methodName : this[methodName],
          timeout  = null,
          failed   = false,
          resumed  = false,
          self     = this;
      
      if (arity === 0)
        return this._runWithExceptionHandlers(function() {
          callable.call(this);
          onSuccess.call(this);
        }, this._processError(onError));
      
      var onUncaughtError = function(error) {
        self.exec(function() {
          failed = true;
          this._removeErrorCatcher();
          if (timeout) JS.ENV.clearTimeout(timeout);
          throw error;
        }, onSuccess, onError);
      };
      this._addErrorCatcher(onUncaughtError);
      
      this._runWithExceptionHandlers(function() {
        callable.call(this, function(asyncBlock) {
          resumed = true;
          self._removeErrorCatcher();
          if (timeout) JS.ENV.clearTimeout(timeout);
          if (!failed) self.exec(asyncBlock, onSuccess, onError);
        });
      }, this._processError(onError));
      
      if (!resumed && JS.ENV.setTimeout)
        timeout = JS.ENV.setTimeout(function() {
          self.exec(function() {
            failed = true;
            this._removeErrorCatcher();
            throw new Error('Timed out after waiting ' + JS.Test.asyncTimeout + ' seconds for test to resume');
          }, onSuccess, onError);
        }, JS.Test.asyncTimeout * 1000);
    },
    
    _addErrorCatcher: function(handler, push) {
      if (!handler) return;
      this._removeErrorCatcher(false);
      
      if (JS.Console.NODE)
        process.addListener('uncaughtException', handler);
      else if (JS.Console.BROWSER)
        window.onerror = handler;
      
      if (push !== false) this.klass.handlers.push(handler);
      return handler;
    },
    
    _removeErrorCatcher: function(pop) {
      var handlers = this.klass.handlers,
          handler  = handlers[handlers.length - 1];
      
      if (!handler) return;
      
      if (JS.Console.NODE)
        process.removeListener('uncaughtException', handler);
      else if (JS.Console.BROWSER)
        delete window.onerror;
      
      if (pop !== false) {
        handlers.pop();
        this._addErrorCatcher(handlers[handlers.length - 1], false);
      }
    },
    
    _processError: function(doNext) {
      return function(e) {
        if (JS.isType(e, JS.Test.Unit.AssertionFailedError))
          this.addFailure(e.message);
        else
          this.addError(e);
        
        if (doNext) doNext.call(this);
      };
    },
    
    _runWithExceptionHandlers: function(_try, _catch, _finally) {
      try {
        _try.call(this);
      } catch (e) {
        if (_catch) _catch.call(this, e);
      } finally {
        if (_finally) _finally.call(this);
      }
    },
    
    setup: function(resume) { resume() },
    
    teardown: function(resume) { resume() },
    
    defaultTest: function() {
      return this.flunk('No tests were specified');
    },
    
    passed: function() {
      return this._testPassed;
    },
    
    size: function() {
      return 1;
    },
    
    addAssertion: function() {
      this._result.addAssertion();
    },
    
    addFailure: function(message) {
      this._testPassed = false;
      this._result.addFailure(new JS.Test.Unit.Failure(this.name(), message));
    },
    
    addError: function(exception) {
      this._testPassed = false;
      this._result.addError(new JS.Test.Unit.Error(this.name(), exception));
    },
    
    name: function() {
      var shortName = this._methodName.replace(/^test\W*/ig, '');
      if (shortName.replace(this.klass.displayName, '') === shortName)
        return this._methodName + '(' + this.klass.displayName + ')';
      else
        return shortName;
    },
    
    toString: function() {
      return this.name();
    }
  })
});

