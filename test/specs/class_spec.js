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
  
  describe("#callSuper", function() {
    before(function() {
      this.Parent = new JS.Class({
        aMethod: function(thing, stuff) { return thing + ", " + stuff }
      })
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
})

