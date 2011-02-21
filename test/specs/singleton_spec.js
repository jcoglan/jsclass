JS.ENV.SingletonSpec = JS.Test.describe(JS.Singleton, function() { with(this) {
  before(function() { with(this) {
    this.mixin  = new JS.Module()
    this.parent = new JS.Class()
  }})
  
  describe("with no ancestors", function() { with(this) {
    before(function() { with(this) {
      this.singleton = new JS.Singleton({ foo: function() { return "foo" } })
    }})
    
    it("creates an object that inherits from Kernel", function() { with(this) {
      assertEqual( [JS.Kernel, singleton.klass, singleton.__eigen__()],
                   singleton.__eigen__().ancestors() )
    }})
    
    it("creates an object with the right methods", function() { with(this) {
      assertEqual( "foo", singleton.foo() )
    }})
  }})
  
  describe("with a parent class", function() { with(this) {
    before(function() { with(this) {
      this.singleton = new JS.Singleton(parent)
    }})
    
    it("creates an object that inherits from the parent", function() { with(this) {
      assertEqual( [JS.Kernel, parent, singleton.klass, singleton.__eigen__()],
                   singleton.__eigen__().ancestors() )
    }})
  }})
  
  describe("with a mixin", function() { with(this) {
    before(function() { with(this) {
      this.singleton = new JS.Singleton({ include: mixin })
    }})
    
    it("creates an object that inherits from the mixin", function() { with(this) {
      assertEqual( [JS.Kernel, mixin, singleton.klass, singleton.__eigen__()],
                   singleton.__eigen__().ancestors() )
    }})
  }})
}})

