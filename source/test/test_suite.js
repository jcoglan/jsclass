/** section: test
 * class JS.Test.Unit.TestSuite
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
      this.name = name || 'Unnamed TestSuite';
      this.tests = [];
      this.toString = function() { return this.name };
    },
    
    /**
     * JS.Test.Unit.TestSuite#run(result, block, context) -> undefined
     * 
     * Runs the tests and/or suites contained in this
     * `TestSuite`.
     **/
    run: function(result, block, context) {
      block.call(context || null, this.klass.STARTED, this.name);
      for (var i = 0, n = this.tests.length; i < n; i++) {
        this.tests[i].run(result, block, context);
      }
      block.call(context || null, this.klass.FINISHED, this.name);
    },
    
    /**
     * JS.Test.Unit.TestSuite#push(test) -> this
     * 
     * Adds the `test` to the suite.
     **/
    push: function(test) {
      this.tests.push(test);
      return this;
    },
    
    /**
     * JS.Test.Unit.TestSuite#remove(test) -> undefined
     **/
    remove: function(test) {
      var i = this.tests.length;
      while (i--) {
        if (this.tests[i] === test) this.tests.splice(i,1);
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
      var totalSize = 0, i = this.tests.length;
      while (i--) {
        totalSize += this.tests[i].size();
      }
      return totalSize;
    },
    
    /**
     * JS.Test.Unit.TestSuite#empty() -> Boolean
     **/
    empty: function() {
      return this.tests.length === 0;
    }
  })
});

