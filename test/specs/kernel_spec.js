JS.ENV.KernelSpec = JS.Test.describe(JS.Kernel, function() {
  include(JS.Test.Helpers)
  
  before(function() {
    this.Class  = new JS.Class("TheClass", {
      upcase: function() { return this._name.toUpperCase() }
    })
    this.object = new Class()
    this.second = new Class()
  })
  
  describe("#__eigen__", function() {
    it("returns a module", function() {
      assertKindOf( JS.Module, object.__eigen__() )
    })
    
    it("returns the same module every time", function() {
      assertSame( object.__eigen__(), object.__eigen__() )
    })
    
    it("returns a module that inherits from the object's class", function() {
      assertEqual( [JS.Kernel, Class, object.__eigen__()], object.__eigen__().ancestors() )
    })
    
    it("returns a module that adds singleton methods to the object", function() {
      assertSame( undefined, object.aMethod )
      object.__eigen__().include({
        aMethod: function() {}
      })
      assertKindOf( Function, object.aMethod )
    })
  })
  
  describe("#equals", function() {
    it("returns true if both references are to the same object", function() {
      assertSame( true, object.equals(object) )
    })
    
    it("returns false if the references are to different objects", function() {
      assertSame( false, object.equals(second) )
    })
    
    it("is symmetric", function() {
      assertSame( object.equals(second), second.equals(object) )
    })
  })
  
  describe("#extend", function() {
    describe("with a plain old object", function() {
      before(function() {
        object.extend({
          setName: function(name) { this._name = name },
          getName: function() { return this._name },
          upcase:  function() { return this.callSuper() + " foo" }
        })
      })
      
      it("does not affect the object's ancestry", function() {
        assertEqual( [JS.Kernel, Class, object.__eigen__()], object.__eigen__().ancestors() )
      })
      
      it("adds methods than run in the context of the object", function() {
        assertEqual( undefined, object._name )
        object.setName("something")
        assertEqual( "something", object._name )
        assertEqual( "something", object.getName() )
      })
      
      it("adds methods that call the class' instance methods with super()", function() {
        object.setName("something")
        assertEqual( "SOMETHING foo", object.upcase() )
      })
      
      describe("followed by a module", function() {
        before(function() {
          object.extend(new JS.Module({
            upcase: function() { return this.callSuper() + " inserted" }
          }))
        })
        
        it("inserts the module's methods behind the object's own", function() {
          object.setName("something")
          assertEqual( "SOMETHING inserted foo", object.upcase() )
        })
      })
    })
    
    describe("with a module", function() {
      before(function() {
        this.extension = new JS.Module({
          setName: function(name) { this._name = name },
          getName: function() { return this._name },
          upcase:  function() { return this.callSuper() + " foo" }
        })
        object.extend(extension)
      })
      
      it("affects the object's ancestry", function() {
        assertEqual( [JS.Kernel, Class, extension, object.__eigen__()], object.__eigen__().ancestors() )
      })
      
      it("adds methods than run in the context of the object", function() {
        assertEqual( undefined, object._name )
        object.setName("something")
        assertEqual( "something", object._name )
        assertEqual( "something", object.getName() )
      })
      
      it("adds methods that call the class' instance methods with super()", function() {
        object.setName("something")
        assertEqual( "SOMETHING foo", object.upcase() )
      })
      
      describe("followed by a plain old object", function() {
        before(function() {
          object.extend({
            upcase: function() { return this.callSuper() + " inserted" }
          })
        })
        
        it("overrides the module's methods", function() {
          object.setName("something")
          assertEqual( "SOMETHING foo inserted", object.upcase() )
        })
      })
    })
  })
  
  describe("#hash", function() {
    it("returns a string", function() {
      assertKindOf( "string", object.hash() )
    })
    
    it("returns a different value for each object", function() {
      assertNotEqual( object.hash(), second.hash() )
    })
    
    it("returns the same value every time for the same object", function() {
      assertEqual( object.hash(), object.hash() )
    })
  })
  
  describe("#isA", function() {
    before(function() {
      this.A = new JS.Module()
      this.B = new JS.Module({ include: A })
      this.C = new JS.Module()
      
      this.Parent = new JS.Class({ include: B })
      this.Child  = new JS.Class(Parent)
      this.Other  = new JS.Class()
      
      this.object = new Child()
    })
    
    it("returns true iff the object is an instance of the class", function() {
      assert( object.isA(Child) )
    })
    
    it("returns true iff the object inherits from the class", function() {
      assert( object.isA(Parent) )
      assert( object.isA(Object) )
    })
    
    it("returns false iff the object is not an instance of the class", function() {
      assert( !object.isA(Other) )
    })
    
    it("returns true iff the object inherits from the module", function() {
      assert( object.isA(A) )
      assert( object.isA(B) )
      assert( object.isA(JS.Kernel) )
    })
    
    it("returns false iff the object does not inherit from the module", function() {
      assert( !object.isA(C) )
    })
    
    it("returns true iff the object is extended using the module", function() {
      object.extend(C)
      assert( object.isA(C) )
    })
    
    it("returns true iff the module is mixed into the object's class", function() {
      Child.include(C)
      assert( object.isA(C) )
    })
  })
  
  describe("#method", function() {
    before(function() {
      this.mixin = new JS.Module({
        mixinMethod: function() { return this._name.toUpperCase() }
      })
      
      Class.include({
        include: mixin,
        initialize: function(name) { this._name = name },
        getName: function() { return this._name }
      })
      this.tate = new Class("Tate")
    })
    
    it("returns a function", function() {
      assertKindOf( Function, object.method("getName") )
    })
    
    it("returns the same function every time", function() {
      assertEqual( tate.method("getName"), tate.method("getName") )
    })
    
    it("returns a function not equal to the unbound method", function() {
      assertNotEqual( tate.getName, tate.method("getName") )
    })
    
    it("returns a bound method", function() {
      var method  = tate.method("getName"),
          unbound = tate.getName;
      
      assertNotEqual( "Tate", unbound() )
      assertEqual( "Tate", method() )
    })
    
    it("returns a different function for each method", function() {
      assertNotEqual( tate.method("equals"), tate.method("getName") )
    })
    
    describe("when the implementation changes in the object", function() {
      before(function() {
        this.getName = tate.method("getName")
        tate.extend({
          getName: function() { return "new singleton method" }
        })
      })
      
      it("still uses the old implementation for existing bound methods", function() {
        assertEqual( "Tate", getName() )
      })
      
      it("returns a new function using the new implementation", function() {
        var newMethod = tate.method("getName")
        assertNotEqual( getName, newMethod )
        assertEqual( "new singleton method", newMethod() )
      })
    })
    
    describe("when the implementation changes in the class", function() {
      before(function() {
        this.getName = tate.method("getName")
        Class.include({
          getName: function() { return "new method" }
        })
      })
      
      it("still uses the old implementation for existing bound methods", function() {
        assertEqual( "Tate", getName() )
      })
      
      it("returns a new function using the new implementation", function() {
        var newMethod = tate.method("getName")
        assertNotEqual( getName, newMethod )
        assertEqual( "new method", newMethod() )
      })
    })
    
    describe("when the implementation changes in a mixin", function() {
      before(function() {
        this.mixinMethod = tate.method("mixinMethod")
        this.mixin.include({
          mixinMethod: function() { return "new mixin method" }
        })
      })
      
      it("still uses the old implementation for existing bound methods", function() {
        assertEqual( "TATE", mixinMethod() )
      })
      
      it("returns a new function using the new implementation", function() {
        var newMethod = tate.method("mixinMethod")
        assertNotEqual( mixinMethod, newMethod )
        assertEqual( "new mixin method", newMethod() )
      })
    })
  })
  
  describe("#methods", function() {
    describe("for an object with no added methods", function() {
      it("returns the methods from Kernel and the object's class", function() {
        assertEqual( ["upcase"].concat(JS.Kernel.instanceMethods()).sort(),
                     object.methods().sort() )
      })
    })
    
    describe("for an object with methods added", function() {
      before(function() {
        object.extend({
          method1: function() {},
          method2: function() {}
        })
      })
      
      it("returns the methods from the object's class and the methods from the object", function() {
        assertEqual( $w("upcase method1 method2").concat(JS.Kernel.instanceMethods()).sort(),
                     object.methods().sort() )
      })
    })
  })
  
  describe("#tap", function() {
    it("returns the object", function() {
      assertSame( object, object.tap(function() {}) )
    })
    
    it("yields the object to the block", function() {
      var yielded = null
      object.tap(function(o) { yielded = o })
      assertSame( object, yielded )
    })
    
    it("allows the context to be set", function() {
      var context = {}, yielded = null
      object.tap(function(o) { yielded = this }, context)
      assertSame( context, yielded )
    })
  })
  
  describe("#toString", function() {
    it("returns a string containing the object's type and its hash", function() {
      assertEqual( "#<TheClass:" + object.hash() + ">", object.toString() )
    })
  })
})

