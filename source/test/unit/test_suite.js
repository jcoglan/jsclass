/** section: test
 * class JS.Test.Unit.TestSuite
 * includes JS.Enumerable
 * 
 * A collection of tests which can be `JS.Test.Unit.TestSuite#run`.
 * 
 * Note: It is easy to confuse a `TestSuite` instance with
 * something that has a static `suite` method; I know because _I_
 * have trouble keeping them straight. Think of something that
 * has a suite method as simply providing a way to get a
 * meaningful `TestSuite` instance. [Nathaniel Talbott]
 **/
JS.Test.Unit.extend({
  TestSuite: new JS.Class({
    include: JS.Enumerable,
    
    extend: {
      STARTED:  'Test.Unit.TestSuite.STARTED',
      FINISHED: 'Test.Unit.TestSuite.FINISHED'
    },
    
    /**
     * new JS.Test.Unit.TestSuite(name)
     * 
     * Creates a new `JS.Test.Unit.TestSuite` with the given `name`.
     **/
    initialize: function(name) {
      this._name = name || 'Unnamed TestSuite';
      this._tests = [];
    },
    
    /**
     * JS.Test.Unit.TestSuite#forEach(block, continuation, context) -> undefined
     * 
     * Iterates over the tests and suites contained in
     * this `TestSuite`.
     **/
    forEach: function(block, continuation, context) {
      var tests   = this._tests,
          looping = false,
          n       = tests.length,
          i       = -1,
          calls   = 0;
      
      var ping = function() {
        calls += 1;
        loop();
      };
      
      var loop = function() {
        if (looping) return;
        looping = true;
        while (calls > 0) iterate();
        looping = false;
      };
      
      var iterate = function() {
        i += 1; calls -= 1;
        if (i === n) return continuation && continuation.call(context || null);
        block.call(context || null, tests[i], ping);
      };
      
      ping();
    },
    
    /**
     * JS.Test.Unit.TestSuite#run(result, continuation, callback, context) -> undefined
     * 
     * Runs the tests and/or suites contained in this
     * `TestSuite`.
     **/
    run: function(result, continuation, callback, context) {
      callback.call(context || null, this.klass.STARTED, this._name);
      
      this.forEach(function(test, resume) {
        test.run(result, resume, callback, context)
        
      }, function() {
        callback.call(context || null, this.klass.FINISHED, this._name);
        continuation();
        
      }, this);
    },
    
    /**
     * JS.Test.Unit.TestSuite#push(test) -> this
     * 
     * Adds the `test` to the suite.
     **/
    push: function(test) {
      this._tests.push(test);
      return this;
    },
    
    /**
     * JS.Test.Unit.TestSuite#remove(test) -> undefined
     **/
    remove: function(test) {
      var i = this._tests.length;
      while (i--) {
        if (this._tests[i] === test) this._tests.splice(i,1);
      }
    },
    
    /**
     * JS.Test.Unit.TestSuite#size() -> Number
     * 
     * Retuns the rolled up number of tests in this suite;
     * i.e. if the suite contains other suites, it counts the
     * tests within those suites, not the suites themselves.
     **/
    size: function() {
      var totalSize = 0, i = this._tests.length;
      while (i--) {
        totalSize += this._tests[i].size();
      }
      return totalSize;
    },
    
    /**
     * JS.Test.Unit.TestSuite#empty() -> Boolean
     **/
    empty: function() {
      return this._tests.length === 0;
    },
    
    /**
     * JS.Test.Unit.TestSuite#toString() -> String
     * 
     * Overridden to return the name given the suite at
     * creation.
     **/
    toString: function() {
      return this._name;
    }
  })
});

