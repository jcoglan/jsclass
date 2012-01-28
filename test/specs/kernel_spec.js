JS.ENV.KernelSpec = JS.Test.describe(JS.Kernel, function() { with(this) {
  include(JS.Test.Helpers)
  
  before(function() { with(this) {
    this.Class  = new JS.Class("TheClass", {
      upcase:   function() { return this._name.toUpperCase() },
      downcase: function() { return this._name.toLowerCase() }
    })
    this.object = new Class()
    this.second = new Class()
  }})
  
  describe("#__eigen__", function() { with(this) {
    it("returns a module", function() { with(this) {
      assertKindOf( JS.Module, object.__eigen__() )
    }})
    
    it("returns the same module every time", function() { with(this) {
      assertSame( object.__eigen__(), object.__eigen__() )
    }})
    
    it("returns a module that inherits from the object's class", function() { with(this) {
      assertEqual( [JS.Kernel, Class, object.__eigen__()], object.__eigen__().ancestors() )
    }})
    
    it("returns a module that adds singleton methods to the object", function() { with(this) {
      assertSame( undefined, object.aMethod )
      object.__eigen__().include({
        aMethod: function() {}
      })
      assertKindOf( Function, object.aMethod )
    }})
  }})
  
  describe("#equals", function() { with(this) {
    it("returns true if both references are to the same object", function() { with(this) {
      assertSame( true, object.equals(object) )
    }})
    
    it("returns false if the references are to different objects", function() { with(this) {
      assertSame( false, object.equals(second) )
    }})
    
    it("is symmetric", function() { with(this) {
      assertSame( object.equals(second), second.equals(object) )
    }})
  }})
  
  describe("#extend", function() { with(this) {
    it("throws an error if an undefined value is given", function() { with(this) {
      assertThrows(Error, function() { object.extend(undefined) })
    }})

    describe("with a plain old object", function() { with(this) {
      before(function() { with(this) {
        object.extend({
          setName: function(name) { this._name = name },
          getName: function() { return this._name },
          upcase:  function() { return this.callSuper() + " foo" }
        })
      }})
      
      it("does not affect the object's ancestry", function() { with(this) {
        assertEqual( [JS.Kernel, Class, object.__eigen__()], object.__eigen__().ancestors() )
      }})
      
      it("does not add methods that the object inherits from its class", function() { with(this) {
        assertEqual( object.klass.prototype.downcase, object.downcase )
        assert( !object.hasOwnProperty("downcase") )
      }})
      
      it("adds methods than run in the context of the object", function() { with(this) {
        assertEqual( undefined, object._name )
        object.setName("something")
        assertEqual( "something", object._name )
        assertEqual( "something", object.getName() )
      }})
      
      it("adds methods that call the class' instance methods with super()", function() { with(this) {
        object.setName("something")
        assertEqual( "SOMETHING foo", object.upcase() )
      }})
      
      describe("followed by a module", function() { with(this) {
        before(function() { with(this) {
          object.extend(new JS.Module({
            upcase: function() { return this.callSuper() + " inserted" }
          }))
        }})
        
        it("inserts the module's methods behind the object's own", function() { with(this) {
          object.setName("something")
          assertEqual( "SOMETHING inserted foo", object.upcase() )
        }})
      }})
    }})
    
    describe("with a module", function() { with(this) {
      before(function() { with(this) {
        this.extension = new JS.Module({
          setName: function(name) { this._name = name },
          getName: function() { return this._name },
          upcase:  function() { return this.callSuper() + " foo" }
        })
        object.extend(extension)
      }})
      
      it("affects the object's ancestry", function() { with(this) {
        assertEqual( [JS.Kernel, Class, extension, object.__eigen__()], object.__eigen__().ancestors() )
      }})
      
      it("adds methods than run in the context of the object", function() { with(this) {
        assertEqual( undefined, object._name )
        object.setName("something")
        assertEqual( "something", object._name )
        assertEqual( "something", object.getName() )
      }})
      
      it("adds methods that call the class' instance methods with super()", function() { with(this) {
        object.setName("something")
        assertEqual( "SOMETHING foo", object.upcase() )
      }})
      
      describe("followed by a plain old object", function() { with(this) {
        before(function() { with(this) {
          object.extend({
            upcase: function() { return this.callSuper() + " inserted" }
          })
        }})
        
        it("overrides the module's methods", function() { with(this) {
          object.setName("something")
          assertEqual( "SOMETHING foo inserted", object.upcase() )
        }})
      }})
    }})
  }})
  
  describe("#hash", function() { with(this) {
    it("returns a string", function() { with(this) {
      assertKindOf( "string", object.hash() )
    }})
    
    it("returns a different value for each object", function() { with(this) {
      assertNotEqual( object.hash(), second.hash() )
    }})
    
    it("returns the same value every time for the same object", function() { with(this) {
      assertEqual( object.hash(), object.hash() )
    }})
  }})
  
  describe("#isA", function() { with(this) {
    before(function() { with(this) {
      this.A = new JS.Module()
      this.B = new JS.Module({ include: A })
      this.C = new JS.Module()
      
      this.Parent = new JS.Class({ include: B })
      this.Child  = new JS.Class(Parent)
      this.Other  = new JS.Class()
      
      this.object = new Child()
    }})
    
    it("returns true iff the object is an instance of the class", function() { with(this) {
      assert( object.isA(Child) )
    }})
    
    it("returns true iff the object inherits from the class", function() { with(this) {
      assert( object.isA(Parent) )
      assert( object.isA(Object) )
    }})
    
    it("returns false iff the object is not an instance of the class", function() { with(this) {
      assert( !object.isA(Other) )
    }})
    
    it("returns true iff the object inherits from the module", function() { with(this) {
      assert( object.isA(A) )
      assert( object.isA(B) )
      assert( object.isA(JS.Kernel) )
    }})
    
    it("returns false iff the object does not inherit from the module", function() { with(this) {
      assert( !object.isA(C) )
    }})
    
    it("returns true iff the object is extended using the module", function() { with(this) {
      object.extend(C)
      assert( object.isA(C) )
    }})
    
    it("returns true iff the module is mixed into the object's class", function() { with(this) {
      Child.include(C)
      assert( object.isA(C) )
    }})
  }})
  
  describe("#method", function() { with(this) {
    before(function() { with(this) {
      this.mixin = new JS.Module({
        mixinMethod: function() { return this._name.toUpperCase() }
      })
      
      Class.include({
        include: mixin,
        initialize: function(name) { this._name = name },
        getName: function() { return this._name }
      })
      this.tate = new Class("Tate")
    }})
    
    it("returns a function", function() { with(this) {
      assertKindOf( Function, object.method("getName") )
    }})
    
    it("returns the same function every time", function() { with(this) {
      assertEqual( tate.method("getName"), tate.method("getName") )
    }})
    
    it("returns a function not equal to the unbound method", function() { with(this) {
      assertNotEqual( tate.getName, tate.method("getName") )
    }})
    
    it("returns a bound method", function() { with(this) {
      var method  = tate.method("getName"),
          unbound = tate.getName;
      
      assertNotEqual( "Tate", unbound() )
      assertEqual( "Tate", method() )
    }})
    
    it("returns a different function for each method", function() { with(this) {
      assertNotEqual( tate.method("equals"), tate.method("getName") )
    }})
    
    describe("when the implementation changes in the object", function() { with(this) {
      before(function() { with(this) {
        this.getName = tate.method("getName")
        tate.extend({
          getName: function() { return "new singleton method" }
        })
      }})
      
      it("still uses the old implementation for existing bound methods", function() { with(this) {
        assertEqual( "Tate", getName() )
      }})
      
      it("returns a new function using the new implementation", function() { with(this) {
        var newMethod = tate.method("getName")
        assertNotEqual( getName, newMethod )
        assertEqual( "new singleton method", newMethod() )
      }})
    }})
    
    describe("when the implementation changes in the class", function() { with(this) {
      before(function() { with(this) {
        this.getName = tate.method("getName")
        Class.include({
          getName: function() { return "new method" }
        })
      }})
      
      it("still uses the old implementation for existing bound methods", function() { with(this) {
        assertEqual( "Tate", getName() )
      }})
      
      it("returns a new function using the new implementation", function() { with(this) {
        var newMethod = tate.method("getName")
        assertNotEqual( getName, newMethod )
        assertEqual( "new method", newMethod() )
      }})
    }})
    
    describe("when the implementation changes in a mixin", function() { with(this) {
      before(function() { with(this) {
        this.mixinMethod = tate.method("mixinMethod")
        this.mixin.include({
          mixinMethod: function() { return "new mixin method" }
        })
      }})
      
      it("still uses the old implementation for existing bound methods", function() { with(this) {
        assertEqual( "TATE", mixinMethod() )
      }})
      
      it("returns a new function using the new implementation", function() { with(this) {
        var newMethod = tate.method("mixinMethod")
        assertNotEqual( mixinMethod, newMethod )
        assertEqual( "new mixin method", newMethod() )
      }})
    }})
  }})
  
  describe("#methods", function() { with(this) {
    describe("for an object with no added methods", function() { with(this) {
      it("returns the methods from Kernel and the object's class", function() { with(this) {
        assertEqual( ["downcase", "upcase"].concat(JS.Kernel.instanceMethods()).sort(),
                     object.methods().sort() )
      }})
    }})
    
    describe("for an object with methods added", function() { with(this) {
      before(function() { with(this) {
        object.extend({
          method1: function() {},
          method2: function() {}
        })
      }})
      
      it("returns the methods from the object's class and the methods from the object", function() { with(this) {
        assertEqual( $w("downcase upcase method1 method2").concat(JS.Kernel.instanceMethods()).sort(),
                     object.methods().sort() )
      }})
    }})
  }})
  
  describe("#tap", function() { with(this) {
    it("returns the object", function() { with(this) {
      assertSame( object, object.tap(function() {}) )
    }})
    
    it("yields the object to the block", function() { with(this) {
      var yielded = null
      object.tap(function(o) { yielded = o })
      assertSame( object, yielded )
    }})
    
    it("allows the context to be set", function() { with(this) {
      var context = {}, yielded = null
      object.tap(function(o) { yielded = this }, context)
      assertSame( context, yielded )
    }})
  }})
  
  describe("#toString", function() { with(this) {
    it("returns a string containing the object's type and its hash", function() { with(this) {
      assertEqual( "#<TheClass:" + object.hash() + ">", object.toString() )
    }})
  }})
}})

