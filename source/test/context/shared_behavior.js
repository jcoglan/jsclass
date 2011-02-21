JS.Test.Context.extend({
  /** section: test
   * class JS.Test.Context.SharedBehavior
   **/
  SharedBehavior: new JS.Class(JS.Module, {
    extend: {
      createFromBehavior: function(beh) {
        var mod = new this();
        mod._behavior = beh;
        return mod;
      },
      
      moduleName: function(name) {
        return name.toLowerCase()
                   .replace(/[\s:',\.~;!#=\(\)&]+/g, '_')
                   .replace(/\/(.?)/g, function(m,a) { return "." + a.toUpperCase() })
                   .replace(/(?:^|_)(.)/g, function(m,a) { return a.toUpperCase() });
      }
    },
    
    included: function(arg) {
      this._behavior.call(arg);
    }
  })
});

JS.Test.Unit.TestCase.extend({
  /**
   * JS.Test.Unit.TestCase.shared(name, block) -> undefined
   * 
   * Share behavior among different contexts.  This creates a module (actually, a Module subclass)
   * that is included using the `use` method (or one of its aliases) provided by context or `include` 
   * if you know the module's constant name.
   *
   * ==== Examples
   *   
   *   shared("other things", function() { with(this) {
   *     it("should do things but not some things", function() { with(this) {
   *       // behavior is fun
   *     }})
   *   }})
   *   
   *   use("other things")
   *   // or...
   *   itShouldBehaveLike("other things")
   *   uses("other things")
   *   behavesLike("other things")
   *
   */
  shared: function(name, block) {
    name = JS.Test.Context.SharedBehavior.moduleName(name);
    JS.ENV[name] = JS.Test.Context.SharedBehavior.createFromBehavior(block);
  },
  
  /**
   * JS.Test.Unit.TestCase.use(name) -> undefined
   * 
   * Pull in behavior shared by `shared` or a module.  
   *
   * ==== Examples
   *   
   *   shared("other things", function() { with(this) {
   *     it("should do things but not some things", function() { with(this) {
   *       // behavior is fun
   *     }})
   *   }})
   *   
   *   use("other things")
   *   // or...
   *   itShouldBehaveLike("other things")
   *   
   *   Things = new JS.Module()
   *   
   *   uses(Things)
   *
   */
  use: function(sharedName) {
    if (JS.isType(sharedName, JS.Test.Context.SharedBehavior) ||
        JS.isType(sharedName, JS.Module))
      this.include(sharedName);
    
    else if (JS.isType(sharedName, 'string')) {
      var name = JS.Test.Context.SharedBehavior.moduleName(sharedName),
          beh  = JS.ENV[name];
      
      if (!beh) throw new Error('Could not find example group named "' + sharedName + '"');
      this.include(beh);
    }
  }
});

(function() {
  var alias = function(method, aliases) {
    var extension = {};
    for (var i = 0, n = aliases.length; i < n; i++)
      extension[aliases[i]] = JS.Test.Unit.TestCase[method];
    JS.Test.Unit.TestCase.extend(extension);
  };
  
  alias('shared', ['sharedBehavior', 'shareAs', 'shareBehaviorAs', 'sharedExamplesFor']);
  alias('use', ['uses', 'itShouldBehaveLike', 'behavesLike', 'usesExamplesFrom']);
})();

