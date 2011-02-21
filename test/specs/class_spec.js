JS.ENV.ClassSpec = JS.Test.describe(JS.Class, function() { with(this) {
  before(function() { with(this) {
    this.subjectClass    = JS.Class
    this.ancestors       = [JS.Kernel]
    this.instanceMethods = JS.Kernel.instanceMethods()
  }})
  
  behavesLike("module")
  
  it("has Module as its parent class", function() { with(this) {
    assertEqual( JS.Module, JS.Class.superclass )
  }})
  
  it("has no subclasses", function() { with(this) {
    assertEqual( [], JS.Class.subclasses )
  }})
  
  describe("with no methods", function() { with(this) {
    before(function() { with(this) {
      this.Class = new JS.Class()
    }})
    
    it("is a class", function() { with(this) {
      assert( Class.isA(JS.Class) )
      assert( Class.isA(JS.Module) )
      assert( Class.isA(JS.Kernel) )
    }})
  }})
  
  describe("with an instance method", function() { with(this) {
    before(function() { with(this) {
      this.Class = new JS.Class({
        aMethod: function() { return "instance method" }
      })
    }})
    
    it("adds the method to its instances", function() { with(this) {
      var instance = new Class()
      assertEqual( "instance method", instance.aMethod() )
    }})
  }})
  
  describe("with an #initialize method", function() { with(this) {
    before(function() { with(this) {
      this.Animal = new JS.Class({
        initialize: function(name, type) {
          this.name = name
          this.type = type
        },
        speak: function(thing) {
          return this.name + " likes " + thing
        }
      })
    }})
    
    it("runs the #initialize method when instantiating an object", function() { with(this) {
      var kermit = new Animal("kermit", "frog")
      assertEqual( "kermit", kermit.name )
      assertEqual( "frog",   kermit.type )
    }})
    
    it("runs other methods in the correct context", function() { with(this) {
      var kermit = new Animal("kermit", "frog")
      assertEqual( "kermit likes miss piggy", kermit.speak("miss piggy") )
    }})
  }})
  
  describe("as a superclass", function() { with(this) {
    before(function() { with(this) {
      this.classA = new JS.Class({
        extend: {
          sMethod: function() { return "bar" }
        },
        aMethod: function() { return "foo" }
      })
      this.classB = new JS.Class(classA)
    }})
    
    it("adds the superclass' method to the subclass", function() { with(this) {
      var object = new classB()
      assertEqual( "foo", object.aMethod() )
    }})
    
    it("adds the superclass as an ancestor to the subclass", function() { with(this) {
      assertEqual( [JS.Kernel, classA, classB], classB.ancestors() )
    }})
    
    it("adds the superclass' singleton methods to the subclass", function() { with(this) {
      assertEqual( "bar", classB.sMethod() )
    }})
    
    it("adds the superclass as an ancestor to the subclass' eigenclass", function() { with(this) {
      assertEqual( [JS.Kernel, JS.Module, JS.Class, classA.__eigen__(), classB.__eigen__()],
                   classB.__eigen__().ancestors() )
    }})
  }})
  
  describe("as a mixin", function() { with(this) {
    before(function() { with(this) {
      this.classA = new JS.Class({
        extend: {
          sMethod: function() { return "bar" }
        },
        aMethod: function() { return "foo" }
      })
      this.classB = new JS.Class({ include: classA })
    }})
    
    it("adds the mixed-in class' method to the includer", function() { with(this) {
      var object = new classB()
      assertEqual( "foo", object.aMethod() )
    }})
    
    it("adds the mixed-in class as an ancestor to the includer", function() { with(this) {
      assertEqual( [JS.Kernel, classA, classB], classB.ancestors() )
    }})
    
    it("does not add the mixed-in class' singleton methods to the includer", function() { with(this) {
      assertEqual( undefined, classB.sMethod )
    }})
    
    it("does not add the mixed-in class as an ancestor to the includer's eigenclass", function() { with(this) {
      assertEqual( [JS.Kernel, JS.Module, JS.Class, classB.__eigen__()],
                   classB.__eigen__().ancestors() )
    }})
  }})
  
  describe("inheriting from a 'native' class", function() { with(this) {
    before(function() { with(this) {
      this.Native = function() {}
      Native.prototype.getMyName = function() { return "Native" }
      
      this.Child = new JS.Class(Native, {
        getMyName: function() { return "Inherited from " + this.callSuper() }
      })
      
      this.nativeObject = new Native()
      this.childObject  = new Child()
    }})
    
    it("makes Native the superclass of Child", function() { with(this) {
      assertEqual( Native, Child.superclass )
    }})
    
    it("makes Child objects instances of Native", function() { with(this) {
      assert( childObject.isA(Native) )
      assert( childObject.isA(Object) )
    }})
    
    it("binds #callSuper to the Native class' methods", function() { with(this) {
      assertEqual( "Inherited from Native", childObject.getMyName() )
    }})
    
    describe("when the Native class gains a method", function() { with(this) {
      before(function() { with(this) {
        Native.prototype.speak = function() { return "um" }
      }})
    
      it("is added to the inheriting object", function() { with(this) {
        assertEqual( "um", childObject.speak() )
      }})
    }})
  }})
  
  describe("#callSuper", function() { with(this) {
    before(function() { with(this) {
      this.Parent = new JS.Class({
        aMethod: function(thing, stuff) { return thing + ", " + stuff }
      })
    }})
    
    it("can be bound using Kernel#method()", function() { with(this) {
      var Child = new JS.Class(Parent, {
        aMethod: function() { return this.method("callSuper") }
      })
      var method = new Child().aMethod()
      assertEqual( "foo, bar", method("foo", "bar") )
    }})
    
    // For backward compatibility: now we can add arbitrary keywords,
    // we don't want to clobber user-defined methods with the same names
    it("calls the real method named callSuper if one exists", function() { with(this) {
      var Child = new JS.Class(Parent, {
        aMethod: function() { return this.callSuper() },
        callSuper: function() { return "super" }
      })
      assertEqual( "super", new Child().aMethod() )
    }})
    
    describe("applying a function", function() { with(this) {
      before(function() { with(this) {
        this.Child = new JS.Class(Parent, {
          aMethod: function() { return this.name + ": " + this.callSuper() }
        })
        this.object = {name: "user"}
      }})
      
      it("uses the inheritance chain of the applied method", function() { with(this) {
        assertEqual( "user: foo, bar", Child.prototype.aMethod.call(object, "foo", "bar") )
      }})
    }})
    
    describe("calling the superclass with implicit args", function() { with(this) {
      before(function() { with(this) {
        this.Child = new JS.Class(Parent, {
          aMethod: function() { return this.callSuper() }
        })
      }})
      
      it("passes args through to the parent method", function() { with(this) {
        var object = new Child()
        assertEqual( "foo, bar", object.aMethod("foo", "bar") )
      }})
    }})
    
    describe("calling the superclass with one explicit arg", function() { with(this) {
      before(function() { with(this) {
        this.Child = new JS.Class(Parent, {
          aMethod: function(a) { return this.callSuper(a.toUpperCase()) }
        })
      }})
      
      it("passes the remaining implicit args after the explicit one", function() { with(this) {
        var object = new Child()
        assertEqual( "FOO, bar", object.aMethod("foo", "bar") )
      }})
    }})
    
    describe("calling the superclass with explicit args", function() { with(this) {
      before(function() { with(this) {
        this.Child = new JS.Class(Parent, {
          aMethod: function(a,b) { return this.callSuper(a.toUpperCase(), b.toUpperCase()) }
        })
      }})
      
      it("passes args through to the parent method", function() { with(this) {
        var object = new Child()
        assertEqual( "FOO, BAR", object.aMethod("foo", "bar") )
      }})
    }})
    
    describe("calling methods from mixins", function() { with(this) {
      before(function() { with(this) {
        this.modA = new JS.Module({ aMethod: function() { return "A" } })
        
        this.modB = new JS.Module({
          include: modA,
          aMethod: function() { return this.callSuper() + ", B" }
        })
        
        this.modC = new JS.Module({
          aMethod: function() { return this.callSuper() + ", C" }
        })
        
        this.modD = new JS.Module({
          include: modA,
          aMethod: function() { return this.callSuper() + ", D" }
        })
        
        this.classE = new JS.Class({
          include: [modB, modC, modD],
          aMethod: function() { return this.callSuper() + ", E" }
        })
        
        this.object = new classE()
      }})
      
      it("uses the object's ancestry to route each super() call", function() { with(this) {
        assertEqual( "A, B, C, D, E", object.aMethod() )
      }})
      
      // http://blog.jcoglan.com/2007/11/14/wheres-my-inheritance/
      describe("when a method in the chain is defined", function() { with(this) {
        before(function() { with(this) {
          modC.define("aMethod", function() { return "override" })
        }})
        
        it("uses the new method when calling super()", function() { with(this) {
          assertEqual( "override, D, E", object.aMethod() )
        }})
      }})
      
      describe("when a method calls super() twice", function() { with(this) {
        before(function() { with(this) {
          modC.define("aMethod", function() {
            return this.callSuper() + ", " + this.callSuper() + ", C"
          })
        }})
        
        it("calls the correct series of methods", function() { with(this) {
          assertEqual( "A, B, A, B, C, D, E", object.aMethod() )
        }})
      }})
      
      describe("when a singleton method calls super()", function() { with(this) {
        before(function() { with(this) {
          object.extend({
            aMethod: function() { return this.callSuper() + ", S" }
          })
        }})
        
        it("routes the call to the object's class's implementation", function() { with(this) {
          assertEqual( "A, B, C, D, E, S", object.aMethod() )
        }})
      }})
    }})
    
    // http://www.ajaxpath.com/javascript-inheritance
    describe("methods referenced by super methods", function() { with(this) {
      before(function() { with(this) {
        this.BaseClass = new JS.Class({
          getName: function() { return "BaseClass(" + this.getId() + ")" },
          getId: function() { return 1 }
        })

        this.SubClass = new JS.Class(BaseClass, {
          getName: function() {
            return "SubClass(" + this.getId() + ") extends " + this.callSuper()
          },
          getId: function() { return 2 }
        })

        this.TopClass = new JS.Class(SubClass, {
          getName: function() {
            return "TopClass(" + this.getId() + ") extends " + this.callSuper()
          },
          getId: function() {
            return this.callSuper()
          }
        })
      }})
      
      it("refer to the implementation in the receiver object", function() { with(this) {
        var top = new TopClass()
        assertEqual( "TopClass(2) extends SubClass(2) extends BaseClass(2)", top.getName() )
      }})
    }})
  }})
  
  describe("#__eigen__", function() { with(this) {
    before(function() { with(this) {
      this.Parent = new JS.Class()
    }})
    
    it("returns a module that inherits from Class", function() { with(this) {
      assertEqual( [JS.Kernel, JS.Module, JS.Class, Parent.__eigen__()],
                   Parent.__eigen__().ancestors() )
    }})
    
    describe("with a superclass", function() { with(this) {
      before(function() { with(this) {
        this.Child = new JS.Class(Parent)
      }})
      
      it("returns a module that inherits from the superclass' eigenclass", function() { with(this) {
        assertEqual( [JS.Kernel, JS.Module, JS.Class, Parent.__eigen__(), Child.__eigen__()],
                     Child.__eigen__().ancestors() )
      }})
    }})
  }})
  
  describe("#extend", function() { with(this) {
    before(function() { with(this) {
      this.Parent = new JS.Class()
      this.Child  = new JS.Class(Parent)
    }})
    
    it("adds the methods to the class and its subclass", function() { with(this) {
      Parent.extend({ aClassMethod: function() { return "hello" } })
      assertEqual( "hello", Child.aClassMethod() )
    }})
    
    describe("with two levels of inheritance", function() { with(this) {
      before(function() { with(this) {
        this.Grandkid = new JS.Class(Child)
      }})
      
      it("adds the methods to all descendants", function() { with(this) {
        Parent.extend({ aClassMethod: function() { return "hello" } })
        assertEqual( "hello", Child.aClassMethod() )
        assertEqual( "hello", Grandkid.aClassMethod() )
      }})
      
      describe("when one subclass has defined the method using #extend", function() { with(this) {
        before(function() { with(this) {
          Grandkid.extend({ aClassMethod: function() { return "hi" } })
        }})
        
        it("does not clobber the subclass' own method", function() { with(this) {
          Parent.extend({ aClassMethod: function() { return "hello" } })
          assertEqual( "hi", Grandkid.aClassMethod() )
        }})
      }})
      
      describe("when one subclass has defined the method without using #extend", function() { with(this) {
        before(function() { with(this) {
          Grandkid.aClassMethod = function() { return "hi" }
        }})
        
        it("clobbers the subclass' own method", function() { with(this) {
          Parent.extend({ aClassMethod: function() { return "hello" } })
          assertEqual( "hello", Grandkid.aClassMethod() )
        }})
      }})
    }})
  }})
  
  describe("#include", function() { with(this) {
    before(function() { with(this) {
      this.Parent   = new JS.Class()
      this.Child    = new JS.Class(Parent)
      this.Grandkid = new JS.Class(Child)
      
      this.parent   = new Parent()
      this.child    = new Child()
      this.grandkid = new Grandkid()
      
      this.mixin  = new JS.Module({ foo: function() { return "foo" } })
      this.plainOldObject = { theMethod: function() { return "the method" } }
    }})
    
    describe("taking a module", function() { with(this) {
      it("makes the mixin an ancestor of the receiver", function() { with(this) {
        assertEqual( [JS.Kernel, Parent], Parent.ancestors() )
        Parent.include(mixin)
        assertEqual( [JS.Kernel, mixin, Parent], Parent.ancestors() )
      }})
      
      it("makes the mixin an ancestor of downstream classes", function() { with(this) {
        Parent.include(mixin)
        assertEqual( [JS.Kernel, mixin, Parent, Child], Child.ancestors() )
        assertEqual( [JS.Kernel, mixin, Parent, Child, Grandkid], Grandkid.ancestors() )
      }})
      
      it("adds the mixin's instance methods indirectly to the receiver", function() { with(this) {
        assertEqual( JS.Kernel.instanceMethods(), Parent.instanceMethods() )
        Parent.include(mixin)
        assertEqual( [], Parent.instanceMethods(false) )
        assertEqual( ["foo"].concat(JS.Kernel.instanceMethods()).sort(),
                     Parent.instanceMethods().sort() )
      }})
      
      it("adds the mixin's instance methods indirectly to downstream classes", function() { with(this) {
        Parent.include(mixin)
        
        assertEqual( [], Child.instanceMethods(false) )
        assertEqual( ["foo"].concat(JS.Kernel.instanceMethods()).sort(),
                     Child.instanceMethods().sort() )
        
        assertEqual( [], Grandkid.instanceMethods(false) )
        assertEqual( ["foo"].concat(JS.Kernel.instanceMethods()).sort(),
                     Grandkid.instanceMethods().sort() )
      }})
      
      it("adds the method to instances of downstream classes", function() { with(this) {
        assertEqual( undefined, parent.foo )
        assertEqual( undefined, child.foo )
        assertEqual( undefined, grandkid.foo )
        
        Parent.include(mixin)
        
        assertEqual( "foo", parent.foo() )
        assertEqual( "foo", child.foo() )
        assertEqual( "foo", grandkid.foo() )
      }})
      
      describe("when the mixin defines methods also defined in a subclass", function() { with(this) {
        before(function() { with(this) {
          Child.include({ foo: function() { return "child foo" } })
        }})
        
        it("adds the mixin method to the receiver but not the subclass", function() { with(this) {
          Parent.include(mixin)
          assertEqual( "foo", parent.foo() )
          assertEqual( "child foo", child.foo() )
          assertEqual( "child foo", grandkid.foo() )
        }})
      }})
    }})
    
    describe("taking a plain old object", function() { with(this) {
      it("does not change the receiver's ancestors", function() { with(this) {
        Parent.include(plainOldObject)
        assertEqual( [JS.Kernel, Parent], Parent.ancestors() )
        assertEqual( [JS.Kernel, Parent, Child], Child.ancestors() )
      }})
      
      it("adds the objects's instance methods directly to the receiver", function() { with(this) {
        Parent.include(plainOldObject)
        assertEqual( ["theMethod"], Parent.instanceMethods(false) )
        assertEqual( ["theMethod"].concat(JS.Kernel.instanceMethods()).sort(),
                     Parent.instanceMethods().sort() )
      }})
      
      it("adds the objects's instance methods indirectly to downstream classes", function() { with(this) {
        Parent.include(plainOldObject)
        
        assertEqual( [], Child.instanceMethods(false) )
        assertEqual( ["theMethod"].concat(JS.Kernel.instanceMethods()).sort(),
                     Child.instanceMethods().sort() )
      }})
      
      it("adds the method to objects that inherit from the receiver", function() { with(this) {
        Parent.include(plainOldObject)
        assertEqual( "the method", parent.theMethod() )
        assertEqual( "the method", child.theMethod() )
        assertEqual( "the method", grandkid.theMethod() )
      }})
    }})
  }})
  
  describe("#inherited", function() { with(this) {
    before(function() { with(this) {
      this.parent = new JS.Class()
      parent.extend({
        inherited: function(base) {
          this.subs = this.subs || []
          this.subs.push(base)
        }
      })
    }})
    
    describe("when the class is inherited", function() { with(this) {
      before(function() { with(this) {
        this.child = new JS.Class(parent)
      }})
      
      it("is called with the new subclass", function() { with(this) {
        assertEqual( [child], parent.subs )
      }})
      
      describe("and the subclass is inherited", function() { with(this) {
        before(function() { with(this) {
          this.grandchild = new JS.Class(child)
        }})
        
        it("is called on the subclass with the grandchild", function() { with(this) {
          assertEqual( [grandchild], child.subs )
        }})
        
        it("is not called on the parent class again", function() { with(this) {
          assertEqual( [child], parent.subs )
        }})
      }})
    }})
  }})
  
  describe("#instanceMethod", function() { with(this) {
    before(function() { with(this) {
      this.module = new JS.Class({ bar: function() {} })
    }})
    
    it("returns the named instance method", function() { with(this) {
      assertSame( module.prototype.bar, module.instanceMethod("bar").callable )
    }})
  }})
  
  describe("method precedence", function() { with(this) {
    before(function() { with(this) {
      this.Class  = new JS.Class({ aMethod: function() { return "Class" } })
      this.Module = new JS.Module({ someCall: function() { return "Module" } })
      this.object = new Class()
    }})
    
    describe("a method in a class", function() { with(this) {
      it("takes precedence over included modules", function() { with(this) {
        var module = new JS.Module({ aMethod: function() { return "module" } })
        Class.include(module)
        assertEqual( "Class", object.aMethod() )
      }})
    }})
    
    describe("a method in a module", function() { with(this) {
      it("gets through if the including class does not define it", function() { with(this) {
        Class.include(Module)
        assertEqual( "Module", object.someCall() )
      }})
      
      it("takes precedence over earlier mixins", function() { with(this) {
        var early = new JS.Module({ someCall: function() { return "early" } })
        Class.include(early)
        Class.include(Module)
        assertEqual( "Module", object.someCall() )
      }})
      
      it("is overriden by later mixins", function() { with(this) {
        var late = new JS.Module({ someCall: function() { return "late" } })
        Class.include(Module)
        Class.include(late)
        assertEqual( "late", object.someCall() )
        
        Module.define("someCall", function() { return "Module" })
        assertEqual( "late", object.someCall() )
      }})
      
      it("is overridden by methods inherited by later mixins", function() { with(this) {
        var parent = new JS.Module({ someCall: function() { return "parent" } })
        var late   = new JS.Module({ include: parent })
        Class.include(Module)
        Class.include(late)
        assertEqual( "parent", object.someCall() )
        
        Module.define("someCall", function() { return "Module" })
        assertEqual( "parent", object.someCall() )
      }})
    }})
  }})
  
  describe("#blockGiven", function() { with(this) {
    before(function() { with(this) {
      this.Class = new JS.Class({
        noArgs:  function() { return this.blockGiven() },
        oneArg:  function(a) { return this.blockGiven() },
        twoArgs: function(a,b) { return this.blockGiven() }
      })
      this.object = new Class()
    }})
    
    it("returns true if a block is passed after all the args", function() { with(this) {
      assert( object.noArgs(function() {}) )
      assert( object.oneArg(0, function() {}) )
      assert( object.twoArgs(0, 1, function() {}) )
    }})
    
    it("returns true if a block and context are passed after all the args", function() { with(this) {
      assert( object.noArgs(function() {}, {}) )
      assert( object.oneArg(0, function() {}, {}) )
      assert( object.twoArgs(0, 1, function() {}, {}) )
    }})
    
    it("returns false is a block is given within the arg list", function() { with(this) {
      assert( !object.oneArg(function() {}) )
      assert( !object.twoArgs(0, function() {}) )
    }})
    
    it("returns false if the item in block position is not a function", function() { with(this) {
      assert( !object.noArgs(true) )
      assert( !object.oneArg(0, true) )
      assert( !object.twoArgs(0, 1, true) )
    }})
  }})
  
  describe("#yield", function() { with(this) {
    before(function() { with(this) {
      this.Class = new JS.Class({
        noArgs:  function() { return this.yieldWith("hi", "there") },
        twoArgs: function(a,b) { this.yieldWith(b) }
      })
      this.object = new Class()
    }})
    
    it("calls the passed callback with the values", function() { with(this) {
      var result
      object.noArgs(function() { result = JS.array(arguments) })
      assertEqual( ["hi", "there"], result )
    }})
    
    it("returns the result of yielding to the callback", function() { with(this) {
      assertEqual( "result", object.noArgs(function() { return "result" }) )
    }})
    
    it("allows arguments before the callback", function() { with(this) {
      var result
      object.twoArgs("o", "hai", function() { result = JS.array(arguments) })
      assertEqual( ["hai"], result )
    }})
    
    it("allows a context to be passed following the block", function() { with(this) {
      var context = {}, result
      object.twoArgs("o", "hai", function() { result = [JS.array(arguments), this] }, context)
      assertEqual( [["hai"], context], result )
    }})
    
    it("does nothing if no block is given", function() { with(this) {
      assertNothingThrown(function() { object.twoArgs("some", "words") })
    }})
  }})
}})
