JS.ENV.ModuleSpec = JS.Test.describe(JS.Module, function() {
  sharedBehavior("module", function() {
    before(function() {
      this.modA = new JS.Module('A')
      this.modB = new JS.Module('B')
      this.modC = new JS.Module('C')
      this.modD = new JS.Module('D')
    })
    
    it("is a Module",             function() { assert( subjectClass.isA(JS.Module) ) })
    it("is a Class",              function() { assert( subjectClass.isA(JS.Class)  ) })
    it("is an instance of Class", function() { assertEqual( JS.Class, subjectClass.klass ) })
    it("inherits from Kernel",    function() { assert( subjectClass.isA(JS.Kernel) ) })
    
    describe("with singleton methods", function() {
      before(function() {
        this.User = new subjectClass({
          extend: {
            find: function(name) {
              return "User " + name
            },
            create: function() {
              return this.className + " not found, so we created it"
            }
          }
        })
      })
      
      it("adds the methods to the class object", function() {
        assertEqual( "User jcoglan", User.find("jcoglan") )
      })
      
      it("runs class methods in the context of the class", function() {
        User.className = "UserClass"
        assertEqual( "UserClass not found, so we created it", User.create() )
      })
    })
    
    describe("#ancestors", function() {
      before(function() {
        this.module = new subjectClass()
      })
      
      describe("with no included modules", function() {
        it("returns the receiver", function() {
          assertEqual( ancestors.concat(module), module.ancestors() )
        })
      })
      
      describe("with an included module", function() {
        before(function() {
          module.include(modA)
        })
        
        it("returns the included module and the receiver", function() {
          assertEqual( ancestors.concat(modA, module), module.ancestors() )
        })
      })
      
      describe("with two included modules", function() {
        before(function() {
          module.include(modC)
          module.include(modD)
        })
        
        it("sorts the modules by inclusion order", function() {
          assertEqual( ancestors.concat(modC, modD, module), module.ancestors() )
        })
      })
      
      describe("with a tree of included modules", function() {
        before(function() {
          // Having includes in this order tests the double inclusion problem
          // http://eigenclass.org/hiki/The+double+inclusion+problem
          module.include(modB)
          modB.include(modA)
        })
        
        it("returns the flattened tree", function() {
          assertEqual( ancestors.concat(modA, modB, module), module.ancestors() )
        })
        
        // Diamond problem: http://en.wikipedia.org/wiki/Diamond_problem
        // 
        //       A
        //      / \
        //     B   C
        //      \ /
        //       D
        //
        describe("with a repeated reference in the tree", function() {
          before(function() {
            modC.include(modA)
            module.include(modC)
          })
          
          it("places the repeated module at its earliest possible position", function() {
            assertEqual( ancestors.concat(modA, modB, modC, module), module.ancestors() )
          })
        })
      })
    })
    
    describe("#displayName", function() {
      before(function() {
        this.module = new subjectClass("NameOfModule", {
          methodOne: function() {},
          methodTwo: function() {}
        })
      })
      
      it("returns the name of the module", function() {
        assertEqual( "NameOfModule", module.displayName )
      })
      
      it("returns the name of each method", function() {
        assertEqual( "NameOfModule#methodOne", module.__fns__.methodOne.callable.displayName )
        assertEqual( "NameOfModule#methodTwo", module.__fns__.methodTwo.callable.displayName )
      })
      
      describe("for nested modules", function() {
        before(function() {
          this.module = new subjectClass("Outer", {
            extend: {
              InnerPublic: new subjectClass({ aMethod: function() {} })
            },
            
            InnerPrivate: new subjectClass({
              aMethod: function() {},
              
              extend: {
                DeepInner: new subjectClass({
                  aMethod: function() {},
                  
                  Klass: new subjectClass({ aMethod: function() {} }),
                  
                  extend: {
                    Foo: new subjectClass({ aMethod: function() {} })
                  }
                })
              }
            })
          })
        })
        
        it("returns the name of an inner public module", function() {
          assertEqual( "Outer.InnerPublic", module.InnerPublic.displayName )
          
          assertEqual( "Outer.InnerPublic#aMethod",
                       module.InnerPublic.__fns__.
                       aMethod.callable.displayName )
        })
        
        it("returns the name of an inner private module", function() {
          assertEqual( "Outer#InnerPrivate",
                       module.__fns__.
                       InnerPrivate.displayName )
          
          assertEqual( "Outer#InnerPrivate#aMethod",
                       module.__fns__.
                       InnerPrivate.__fns__.
                       aMethod.callable.displayName )
        })
        
        it("returns the name of a deeply nested module", function() {
          assertEqual( "Outer#InnerPrivate.DeepInner",
                       module.__fns__.
                       InnerPrivate.DeepInner.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner#aMethod",
                       module.__fns__.
                       InnerPrivate.DeepInner.__fns__.
                       aMethod.callable.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner.Foo",
                       module.__fns__.
                       InnerPrivate.DeepInner.
                       Foo.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner.Foo#aMethod",
                       module.__fns__.
                       InnerPrivate.DeepInner.
                       Foo.__fns__.
                       aMethod.callable.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner#Klass",
                       module.__fns__.
                       InnerPrivate.DeepInner.__fns__.
                       Klass.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner#Klass#aMethod",
                       module.__fns__.
                       InnerPrivate.DeepInner.__fns__.
                       Klass.__fns__.
                       aMethod.callable.displayName )
        })
      })
    })
    
    describe("#extended", function() {
      before(function() {
        this.extenders = []
        this.module = new subjectClass()
        this.module.extend({
          extended: function(base) { extenders.push(base) }
        })
      })
      
      describe("when the module is included by a module", function() {
        before(function() {
          this.hostModule = new JS.Module()
          hostModule.include(module)
        })
        
        it("is not called", function() {
          assertEqual( [], extenders )
        })
      })
      
      describe("when the module is included by a class", function() {
        before(function() {
          this.hostClass = new JS.Class()
          hostClass.include(module)
        })
        
        it("is not called", function() {
          assertEqual( [], extenders )
        })
      })
      
      describe("when the module is used to extend a class", function() {
        before(function() {
          this.hostClass = new JS.Class()
          hostClass.extend(module)
        })
        
        it("is called with the extended class", function() {
          assertEqual( [hostClass], extenders )
        })
        
        describe("and that class is inherited", function() {
          before(function() {
            this.child = new JS.Class(hostClass)
          })
          
          it("is not called with the subclass", function() {
            assertEqual( [hostClass], extenders )
          })
        })
      })
      
      describe("when the module is used to extend an object", function() {
        before(function() {
          this.hostModule = new JS.Module()
          hostModule.extend(module)
        })
        
        it("is called with the extended object", function() {
          assertEqual( [hostModule], extenders )
        })
      })
    })
    
    describe("#included", function() {
      before(function() {
        this.includers = []
        this.module = new subjectClass({ theMethod: function() { return "an instance method" } })
        this.module.extend({
          included: function(base) { includers.push(base) }
        })
      })
      
      describe("when the module is included by a module", function() {
        before(function() {
          this.hostModule = new JS.Module()
          hostModule.include(module)
        })
        
        it("is called once with the including module", function() {
          assertEqual( [hostModule], includers )
        })
        
        describe("and the including module is included somewhere else", function() {
          before(function() {
            assertEqual( ancestors.concat([module, hostModule]), hostModule.ancestors() )
            this.target = new JS.Module()
            target.include(hostModule)
          })
          
          it("is not called with the indirectly including module", function() {
            assertEqual( [hostModule], includers )
          })
        })
      })
      
      describe("when the module is used to extend an object", function() {
        before(function() {
          this.object = new JS.Module()
          object.extend(module)
        })
        
        it("is not called", function() {
          assertEqual( [], includers )
        })
      })
      
      describe("when the module is included by a class", function() {
        before(function() {
          this.hostClass = new JS.Class()
          hostClass.include(module)
        })
        
        it("is called once with the including class", function() {
          assertEqual( [hostClass], includers )
        })
      })
      
      describe("when the module is used to extend a class", function() {
        before(function() {
          this.object = new JS.Class()
          object.extend(module)
        })
        
        it("is not called", function() {
          assertEqual( [], includers )
        })
      })
      
      describe("when the hook causes the host to extend itself with the same module", function() {
        before(function() {
          module.extend({
            included: function(base) { base.extend(this) }
          })
          this.hostClass = new JS.Class()
          hostClass.include(module)
        })
        
        it("adds the module's methods as instance methods to the host", function() {
          assertEqual( "an instance method", (new hostClass()).theMethod() )
        })
        
        it("adds the module's methods as singleton methods to the host", function() {
          assertEqual( "an instance method", hostClass.theMethod() )
        })
      })
    })
    
    describe("#instanceMethod", function() {
      before(function() {
        this.module = new subjectClass({ aMethod: function() {} })
      })
      
      it("returns a Method", function() {
        assertKindOf( JS.Method, module.instanceMethod("aMethod") )
      })
      
      it("returns a the named method from the module", function() {
        assertEqual( "aMethod", module.instanceMethod("aMethod").name )
      })
      
      describe("with inherited methods", function() {
        before(function() {
          this.includer = new subjectClass({ include: module })
        })
        
        it("returns the named method from its inheritance chain", function() {
          assertSame( includer.instanceMethod("aMethod"),
                      module.instanceMethod("aMethod") )
        })
      })
    })
    
    describe("#instanceMethods", function() {
      before(function() {
        this.module = new subjectClass()
      })
      
      describe("with no methods", function() {
        it("returns a list of inherited methods", function() {
          assertEqual( instanceMethods, module.instanceMethods() )
        })
        
        it("returns an empty list when called with false", function() {
          assertEqual( [], module.instanceMethods(false) )
        })
      })
      
      describe("with some methods", function() {
        before(function() {
          this.module.define("aMethod", function() {})
          this.module.define("bMethod", function() {})
        })
        
        it("returns the inherited methods and the module's own methods", function() {
          assertEqual( instanceMethods.concat("aMethod", "bMethod").sort(),
                       module.instanceMethods().sort() )
        })
        
        it("returns only the module's own methods when called with false", function() {
          assertEqual( ["aMethod", "bMethod"], module.instanceMethods(false) )
        })
      })
    })
  })
  
  before(function() {
    this.subjectClass    = JS.Module
    this.ancestors       = []
    this.instanceMethods = []
  })
  
  behavesLike("module")
  
  it("has Object as its parent class", function() {
    assertEqual( Object, JS.Module.superclass )
  })
  
  it("has Class as a subclass", function() {
    assertEqual( 0, JS.indexOf(JS.Module.subclasses, JS.Class) )
  })
  
  describe("#define", function() {
    before(function() {
      this.parent = new JS.Module("Parent")
      this.child  = new JS.Module("Child", {aMethod: function() {}})
      child.include(parent)
    })
    
    it("adds the method to modules that depend on the receiver", function() {
      assertEqual( [child.instanceMethod("aMethod")], child.lookup("aMethod") )
      parent.define("aMethod", function() {})
      assertEqual( [parent.instanceMethod("aMethod"), child.instanceMethod("aMethod")], child.lookup("aMethod") )
    })
  })
  
  describe("#include", function() {
    before(function() {
      this.module = new JS.Module()
      this.mixin  = new JS.Module({ foo: function() { return "foo" } })
      
      this.plainOldObject = { theMethod: function() { return "the method" } }
      
      this.Class = new JS.Class({ include: module })
      this.object = new Class()
    })
    
    describe("taking a module", function() {
      it("makes the mixin an ancestor of the receiver", function() {
        assertEqual( [module], module.ancestors() )
        module.include(mixin)
        assertEqual( [mixin, module], module.ancestors() )
      })
      
      it("makes the mixin an ancestor of downstream classes", function() {
        assertEqual( [JS.Kernel, module, Class], Class.ancestors() )
        module.include(mixin)
        assertEqual( [JS.Kernel, mixin, module, Class], Class.ancestors() )
      })
      
      it("adds the mixin's instance methods indirectly to the receiver", function() {
        assertEqual( [], module.instanceMethods() )
        module.include(mixin)
        assertEqual( ["foo"], module.instanceMethods() )
        assertEqual( [], module.instanceMethods(false) )
      })
      
      it("adds the mixin's instance methods indirectly to downstream classes", function() {
        assertEqual( JS.Kernel.instanceMethods(), Class.instanceMethods() )
        module.include(mixin)
        assertEqual( ["foo"].concat(JS.Kernel.instanceMethods()).sort(),
                     Class.instanceMethods().sort() )
      })
      
      it("adds the method to objects that inherit from the receiver", function() {
        assertEqual( undefined, object.foo )
        module.include(mixin)
        assertEqual( "foo", object.foo() )
      })
      
      describe("when the mixin defines methods also defined in the receiver", function() {
        before(function() {
          module.define("foo", function() { return "module foo" })
        })
        
        it("does not clobber the method on downstream objects", function() {
          module.include(mixin)
          assertEqual( "module foo", object.foo() )
        })
      })
    })
    
    describe("taking a plain old object", function() {
      it("does not change the receiver's ancestors", function() {
        module.include(plainOldObject)
        assertEqual( [module], module.ancestors() )
        assertEqual( [JS.Kernel, module, Class], Class.ancestors() )
      })
      
      it("adds the object's methods directly to the receiver", function() {
        module.include(plainOldObject)
        assertEqual( ["theMethod"], module.instanceMethods() )
        assertEqual( ["theMethod"], module.instanceMethods(false) )
      })
      
      it("adds the object's methods indirectly to downstream classes", function() {
        module.include(plainOldObject)
        assertEqual( [], Class.instanceMethods(false) )
        assertEqual( ["theMethod"].concat(JS.Kernel.instanceMethods()).sort(),
                     Class.instanceMethods().sort() )
      })
      
      it("adds the method to objects that inherit from the receiver", function() {
        assertEqual( undefined, object.theMethod )
        module.include(plainOldObject)
        assertEqual( "the method", object.theMethod() )
      })
    })
  })
  
  describe("#instanceMethod", function() {
    before(function() {
      this.module = new JS.Module({ bar: function() {} })
    })
    
    it("returns the named instance method", function() {
      assertSame( module.__fns__.bar, module.instanceMethod("bar") )
    })
  })
})

