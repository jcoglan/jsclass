/** section: test
 * mixin JS.Test.Context.Test
 **/
JS.Test.Context.Test = new JS.Module({
  /**
   * JS.Test.Context.Test#test(name, opts, block) -> undefined
   * 
   * Create a test method. `name` is a native-language string to describe the test
   * (e.g., no more `testThisCrazyThingWithCamelCase`).
   *
   *     test("A user should not be able to delete another user", function() { with(this) {
   *       assert( user.can('delete', otherUser) );
   *     }})
   **/
  test: function(name, opts, block) {
    var testName = 'test:', contextName = this.getContextName();
    if (contextName) testName += ' ' + contextName;
    testName += ' ' + name;
    
    if (this.instanceMethod(testName)) throw new Error(testName + ' is already defined in ' + this.displayName);
    
    opts = opts || {};
    
    if (JS.isFn(opts)) {
      block = opts;
    } else {     
      if (opts.before !== undefined)
        this.before_should_callbacks[testName] = opts.before;
    }
    
    this.define(testName, JS.Test.selfless(block));
  },
  
  beforeTest: function(name, block) {
    this.test(name, {before: block}, function() {});
  }
});

(function() {
  var m = JS.Test.Context.Test.method('instanceMethod');
  
  JS.Test.Context.Test.include({
    it:     m('test'),
    should: m('test'),
    tests:  m('test'),
    
    beforeIt:     m('beforeTest'),
    beforeShould: m('beforeTest'),
    beforeTests:  m('beforeTest')
  });
})();

