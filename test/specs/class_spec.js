ClassSpec = JS.Test.describe(JS.Class, function() {
  before(function() {
    this.subjectClass    = JS.Class
    this.ancestors       = [JS.Kernel]
    this.instanceMethods = JS.Kernel.instanceMethods()
  })
  
  behavesLike("module")
  
  it("has Module as its parent class", function() {
    assertEqual( JS.Module, JS.Class.superclass )
  })
  
  it("has no subclasses", function() {
    assertEqual( [], JS.Class.subclasses )
  })
  
  describe("with no methods", function() {
    before(function() {
      this.Class = new JS.Class()
    })
    
    it("is a class", function() {
      assert( Class.isA(JS.Class) )
      assert( Class.isA(JS.Module) )
      assert( Class.isA(JS.Kernel) )
    })
  })
  
  describe("with an instance method", function() {
    before(function() {
      this.Class = new JS.Class({
        aMethod: function() { return "instance method" }
      })
    })
    
    it("adds the method to its instances", function() {
      var instance = new Class()
      assertEqual( "instance method", instance.aMethod() )
    })
  })
  
  describe("with an #initialize method", function() {
    before(function() {
      this.Animal = new JS.Class({
        initialize: function(name, type) {
          this.name = name
          this.type = type
        },
        speak: function(thing) {
          return this.name + " likes " + thing
        }
      })
    })
    
    it("runs the #initialize method when instantiating an object", function() {
      var kermit = new Animal("kermit", "frog")
      assertEqual( "kermit", kermit.name )
      assertEqual( "frog",   kermit.type )
    })
    
    it("runs other methods in the correct context", function() {
      var kermit = new Animal("kermit", "frog")
      assertEqual( "kermit likes miss piggy", kermit.speak("miss piggy") )
    })
  })
  
  describe("as a superclass", function() {
    before(function() {
      this.classA = new JS.Class({
        extend: {
          sMethod: function() { return "bar" }
        },
        aMethod: function() { return "foo" }
      })
      this.classB = new JS.Class(classA)
    })
    
    it("adds the superclass' method to the subclass", function() {
      var object = new classB()
      assertEqual( "foo", object.aMethod() )
    })
    
    it("adds the superclass as an ancestor to the subclass", function() {
      assertEqual( [JS.Kernel, classA, classB], classB.ancestors() )
    })
    
    it("adds the superclass' singleton methods to the subclass", function() {
      assertEqual( "bar", classB.sMethod() )
    })
    
    it("adds the superclass as an ancestor to the subclass' eigenclass", function() {
      assertEqual( [JS.Kernel, JS.Module, JS.Class, classA.__eigen__(), classB.__eigen__()],
                   classB.__eigen__().ancestors() )
    })
  })
  
  describe("as a mixin", function() {
    before(function() {
      this.classA = new JS.Class({
        extend: {
          sMethod: function() { return "bar" }
        },
        aMethod: function() { return "foo" }
      })
      this.classB = new JS.Class({ include: classA })
    })
    
    it("adds the mixed-in class' method to the includer", function() {
      var object = new classB()
      assertEqual( "foo", object.aMethod() )
    })
    
    it("adds the mixed-in class as an ancestor to the includer", function() {
      assertEqual( [JS.Kernel, classA, classB], classB.ancestors() )
    })
    
    it("does not add the mixed-in class' singleton methods to the includer", function() {
      assertEqual( undefined, classB.sMethod )
    })
    
    it("does not add the mixed-in class as an ancestor to the includer's eigenclass", function() {
      assertEqual( [JS.Kernel, JS.Module, JS.Class, classB.__eigen__()],
                   classB.__eigen__().ancestors() )
    })
  })
  
  describe("inheriting from a 'native' class", function() {
    before(function() {
      this.Native = function() {}
      Native.prototype.getMyName = function() { return "Native" }
      
      this.Child = new JS.Class(Native, {
        getMyName: function() { return "Inherited from " + this.callSuper() }
      })
      
      this.nativeObject = new Native()
      this.childObject  = new Child()
    })
    
    it("makes Native the superclass of Child", function() {
      assertEqual( Native, Child.superclass )
    })
    
    it("makes Child objects instances of Native", function() {
      assert( childObject.isA(Native) )
      assert( childObject.isA(Object) )
    })
    
    it("binds #callSuper to the Native class' methods", function() {
      assertEqual( "Inherited from Native", childObject.getMyName() )
    })
    
    describe("when the Native class gains a method", function() {
      before(function() {
        Native.prototype.speak = function() { return "um" }
      })
    
      it("is added to the inheriting object", function() {
        assertEqual( "um", childObject.speak() )
      })
    })
  })
  
  describe("#callSuper", function() {
    before(function() {
      this.Parent = new JS.Class({
        aMethod: function(thing, stuff) { return thing + ", " + stuff }
      })
    })
    
    it("can be bound using Kernel#method()", function() {
      var Child = new JS.Class(Parent, {
        aMethod: function() { return this.method("callSuper") }
      })
      var method = new Child().aMethod()
      assertEqual( "foo, bar", method("foo", "bar") )
    })
    
    describe("calling the superclass with implicit args", function() {
      before(function() {
        this.Child = new JS.Class(Parent, {
          aMethod: function() { return this.callSuper() }
        })
      })
      
      it("passes args through to the parent method", function() {
        var object = new Child()
        assertEqual( "foo, bar", object.aMethod("foo", "bar") )
      })
    })
    
    describe("calling the superclass with one explicit arg", function() {
      before(function() {
        this.Child = new JS.Class(Parent, {
          aMethod: function(a) { return this.callSuper(a.toUpperCase()) }
        })
      })
      
      it("passes the remaining implicit args after the explicit one", function() {
        var object = new Child()
        assertEqual( "FOO, bar", object.aMethod("foo", "bar") )
      })
    })
    
    describe("calling the superclass with explicit args", function() {
      before(function() {
        this.Child = new JS.Class(Parent, {
          aMethod: function(a,b) { return this.callSuper(a.toUpperCase(), b.toUpperCase()) }
        })
      })
      
      it("passes args through to the parent method", function() {
        var object = new Child()
        assertEqual( "FOO, BAR", object.aMethod("foo", "bar") )
      })
    })
    
    describe("calling methods from mixins", function() {
      before(function() {
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
      })
      
      it("uses the object's ancestry to route each super() call", function() {
        assertEqual( "A, B, C, D, E", object.aMethod() )
      })
      
      // http://blog.jcoglan.com/2007/11/14/wheres-my-inheritance/
      describe("when a method in the chain is defined", function() {
        before(function() {
          modC.define("aMethod", function() { return "override" })
        })
        
        it("uses the new method when calling super()", function() {
          assertEqual( "override, D, E", object.aMethod() )
        })
      })
      
      describe("when a method calls super() twice", function() {
        before(function() {
          modC.define("aMethod", function() {
            return this.callSuper() + ", " + this.callSuper() + ", C"
          })
        })
        
        it("calls the correct series of methods", function() {
          assertEqual( "A, B, A, B, C, D, E", object.aMethod() )
        })
      })
      
      describe("when a singleton method calls super()", function() {
        before(function() {
          object.extend({
            aMethod: function() { return this.callSuper() + ", S" }
          })
        })
        
        it("routes the call to the object's class's implementation", function() {
          assertEqual( "A, B, C, D, E, S", object.aMethod() )
        })
      })
    })
    
    // http://www.ajaxpath.com/javascript-inheritance
    describe("methods referenced by super methods", function() {
      before(function() {
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
      })
      
      it("refer to the implementation in the receiver object", function() {
        var top = new TopClass()
        assertEqual( "TopClass(2) extends SubClass(2) extends BaseClass(2)", top.getName() )
      })
    })
  })
  
  describe("#__eigen__", function() {
    before(function() {
      this.Parent = new JS.Class()
    })
    
    it("returns a module that inherits from Class", function() {
      assertEqual( [JS.Kernel, JS.Module, JS.Class, Parent.__eigen__()],
                   Parent.__eigen__().ancestors() )
    })
    
    describe("with a superclass", function() {
      before(function() {
        this.Child = new JS.Class(Parent)
      })
      
      it("returns a module that inherits from the superclass' eigenclass", function() {
        assertEqual( [JS.Kernel, JS.Module, JS.Class, Parent.__eigen__(), Child.__eigen__()],
                     Child.__eigen__().ancestors() )
      })
    })
  })
  
  describe("#extend", function() {
    before(function() {
      this.Parent = new JS.Class()
      this.Child  = new JS.Class(Parent)
    })
    
    it("adds the methods to the class and its subclass", function() {
      Parent.extend({ aClassMethod: function() { return "hello" } })
      assertEqual( "hello", Child.aClassMethod() )
    })
    
    describe("with two levels of inheritance", function() {
      before(function() {
        this.Grandkid = new JS.Class(Child)
      })
      
      it("adds the methods to all descendants", function() {
        Parent.extend({ aClassMethod: function() { return "hello" } })
        assertEqual( "hello", Child.aClassMethod() )
        assertEqual( "hello", Grandkid.aClassMethod() )
      })
      
      describe("when one subclass has defined the method using #extend", function() {
        before(function() {
          Grandkid.extend({ aClassMethod: function() { return "hi" } })
        })
        
        it("does not clobber the subclass' own method", function() {
          Parent.extend({ aClassMethod: function() { return "hello" } })
          assertEqual( "hi", Grandkid.aClassMethod() )
        })
      })
      
      describe("when one subclass has defined the method without using #extend", function() {
        before(function() {
          Grandkid.aClassMethod = function() { return "hi" }
        })
        
        it("clobbers the subclass' own method", function() {
          Parent.extend({ aClassMethod: function() { return "hello" } })
          assertEqual( "hello", Grandkid.aClassMethod() )
        })
      })
    })
  })
  
  describe("#include", function() {
    before(function() {
      this.Parent   = new JS.Class()
      this.Child    = new JS.Class(Parent)
      this.Grandkid = new JS.Class(Child)
      
      this.parent   = new Parent()
      this.child    = new Child()
      this.grandkid = new Grandkid()
      
      this.mixin  = new JS.Module({ foo: function() { return "foo" } })
      this.plainOldObject = { theMethod: function() { return "the method" } }
    })
    
    describe("taking a module", function() {
      it("makes the mixin an ancestor of the receiver", function() {
        assertEqual( [JS.Kernel, Parent], Parent.ancestors() )
        Parent.include(mixin)
        assertEqual( [JS.Kernel, mixin, Parent], Parent.ancestors() )
      })
      
      it("makes the mixin an ancestor of downstream classes", function() {
        Parent.include(mixin)
        assertEqual( [JS.Kernel, mixin, Parent, Child], Child.ancestors() )
        assertEqual( [JS.Kernel, mixin, Parent, Child, Grandkid], Grandkid.ancestors() )
      })
      
      it("adds the mixin's instance methods indirectly to the receiver", function() {
        assertEqual( JS.Kernel.instanceMethods(), Parent.instanceMethods() )
        Parent.include(mixin)
        assertEqual( [], Parent.instanceMethods(false) )
        assertEqual( ["foo"].concat(JS.Kernel.instanceMethods()).sort(),
                     Parent.instanceMethods().sort() )
      })
      
      it("adds the mixin's instance methods indirectly to downstream classes", function() {
        Parent.include(mixin)
        
        assertEqual( [], Child.instanceMethods(false) )
        assertEqual( ["foo"].concat(JS.Kernel.instanceMethods()).sort(),
                     Child.instanceMethods().sort() )
        
        assertEqual( [], Grandkid.instanceMethods(false) )
        assertEqual( ["foo"].concat(JS.Kernel.instanceMethods()).sort(),
                     Grandkid.instanceMethods().sort() )
      })
      
      it("adds the method to instances of downstream classes", function() {
        assertEqual( undefined, parent.foo )
        assertEqual( undefined, child.foo )
        assertEqual( undefined, grandkid.foo )
        
        Parent.include(mixin)
        
        assertEqual( "foo", parent.foo() )
        assertEqual( "foo", child.foo() )
        assertEqual( "foo", grandkid.foo() )
      })
      
      describe("when the mixin defines methods also defined in a subclass", function() {
        before(function() {
          Child.include({ foo: function() { return "child foo" } })
        })
        
        it("adds the mixin method to the receiver but not the subclass", function() {
          Parent.include(mixin)
          assertEqual( "foo", parent.foo() )
          assertEqual( "child foo", child.foo() )
          assertEqual( "child foo", grandkid.foo() )
        })
      })
    })
    
    describe("taking a plain old object", function() {
      it("does not change the receiver's ancestors", function() {
        Parent.include(plainOldObject)
        assertEqual( [JS.Kernel, Parent], Parent.ancestors() )
        assertEqual( [JS.Kernel, Parent, Child], Child.ancestors() )
      })
      
      it("adds the objects's instance methods directly to the receiver", function() {
        Parent.include(plainOldObject)
        assertEqual( ["theMethod"], Parent.instanceMethods(false) )
        assertEqual( ["theMethod"].concat(JS.Kernel.instanceMethods()).sort(),
                     Parent.instanceMethods().sort() )
      })
      
      it("adds the objects's instance methods indirectly to downstream classes", function() {
        Parent.include(plainOldObject)
        
        assertEqual( [], Child.instanceMethods(false) )
        assertEqual( ["theMethod"].concat(JS.Kernel.instanceMethods()).sort(),
                     Child.instanceMethods().sort() )
      })
      
      it("adds the method to objects that inherit from the receiver", function() {
        Parent.include(plainOldObject)
        assertEqual( "the method", parent.theMethod() )
        assertEqual( "the method", child.theMethod() )
        assertEqual( "the method", grandkid.theMethod() )
      })
    })
  })
  
  describe("#inherited", function() {
    before(function() {
      this.parent = new JS.Class()
      parent.extend({
        inherited: function(base) {
          this.subs = this.subs || []
          this.subs.push(base)
        }
      })
    })
    
    describe("when the class is inherited", function() {
      before(function() {
        this.child = new JS.Class(parent)
      })
      
      it("is called with the new subclass", function() {
        assertEqual( [child], parent.subs )
      })
      
      describe("and the subclass is inherited", function() {
        before(function() {
          this.grandchild = new JS.Class(child)
        })
        
        it("is called on the subclass with the grandchild", function() {
          assertEqual( [grandchild], child.subs )
        })
        
        it("is not called on the parent class again", function() {
          assertEqual( [child], parent.subs )
        })
      })
    })
  })
  
  describe("#instanceMethod", function() {
    before(function() {
      this.module = new JS.Class({ bar: function() {} })
    })
    
    it("returns the named instance method", function() {
      assertSame( module.prototype.bar, module.instanceMethod("bar").callable )
    })
  })
  
  describe("method precedence", function() {
    before(function() {
      this.Class  = new JS.Class({ aMethod: function() { return "Class" } })
      this.Module = new JS.Module({ someCall: function() { return "Module" } })
      this.object = new Class()
    })
    
    describe("a method in a class", function() {
      it("takes precedence over included modules", function() {
        var module = new JS.Module({ aMethod: function() { return "module" } })
        Class.include(module)
        assertEqual( "Class", object.aMethod() )
      })
    })
    
    describe("a method in a module", function() {
      it("gets through if the including class does not define it", function() {
        Class.include(Module)
        assertEqual( "Module", object.someCall() )
      })
      
      it("takes precedence over earlier mixins", function() {
        var early = new JS.Module({ someCall: function() { return "early" } })
        Class.include(early)
        Class.include(Module)
        assertEqual( "Module", object.someCall() )
      })
      
      it("is overriden by later mixins", function() {
        var late = new JS.Module({ someCall: function() { return "late" } })
        Class.include(Module)
        Class.include(late)
        assertEqual( "late", object.someCall() )
        
        Module.define("someCall", function() { return "Module" })
        assertEqual( "late", object.someCall() )
      })
      
      it("is overridden by methods inherited by later mixins", function() {
        var parent = new JS.Module({ someCall: function() { return "parent" } })
        var late   = new JS.Module({ include: parent })
        Class.include(Module)
        Class.include(late)
        assertEqual( "parent", object.someCall() )
        
        Module.define("someCall", function() { return "Module" })
        assertEqual( "parent", object.someCall() )
      })
    })
  })
  
  describe("#blockGiven", function() {
    before(function() {
      this.Class = new JS.Class({
        noArgs:  function() { return this.blockGiven() },
        oneArg:  function(a) { return this.blockGiven() },
        twoArgs: function(a,b) { return this.blockGiven() }
      })
      this.object = new Class()
    })
    
    it("returns true if a block is passed after all the args", function() {
      assert( object.noArgs(function() {}) )
      assert( object.oneArg(0, function() {}) )
      assert( object.twoArgs(0, 1, function() {}) )
    })
    
    it("returns true if a block and context are passed after all the args", function() {
      assert( object.noArgs(function() {}, {}) )
      assert( object.oneArg(0, function() {}, {}) )
      assert( object.twoArgs(0, 1, function() {}, {}) )
    })
    
    it("returns false is a block is given within the arg list", function() {
      assert( !object.oneArg(function() {}) )
      assert( !object.twoArgs(0, function() {}) )
    })
    
    it("returns false if the item in block position is not a function", function() {
      assert( !object.noArgs(true) )
      assert( !object.oneArg(0, true) )
      assert( !object.twoArgs(0, 1, true) )
    })
  })
  
  describe("#yield", function() {
    before(function() {
      this.Class = new JS.Class({
        noArgs:  function() { this.yield("hi", "there") },
        twoArgs: function(a,b) { this.yield(b) }
      })
      this.object = new Class()
    })
    
    it("calls the passed callback with the values", function() {
      var result
      object.noArgs(function() { result = JS.array(arguments) })
      assertEqual( ["hi", "there"], result )
    })
    
    it("allows arguments before the callback", function() {
      var result
      object.twoArgs("o", "hai", function() { result = JS.array(arguments) })
      assertEqual( ["hai"], result )
    })
    
    it("allows a context to be passed following the block", function() {
      var context = {}, result
      object.twoArgs("o", "hai", function() { result = [JS.array(arguments), this] }, context)
      assertEqual( [["hai"], context], result )
    })
  })
})

