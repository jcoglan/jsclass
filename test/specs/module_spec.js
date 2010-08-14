ModuleSpec = JS.Test.describe(JS.Module, function() {
  sharedBehavior("module", function() {
    before(function() {
      this.modA = new JS.Module('A')
      this.modB = new JS.Module('B')
      this.modC = new JS.Module('C')
      this.modD = new JS.Module('D')
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
        assertEqual( "NameOfModule#methodOne", module.__mod__.__fns__.methodOne.displayName )
        assertEqual( "NameOfModule#methodTwo", module.__mod__.__fns__.methodTwo.displayName )
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
                       module.InnerPublic.__mod__.__fns__.
                       aMethod.displayName )
        })
        
        it("returns the name of an inner private module", function() {
          assertEqual( "Outer#InnerPrivate",
                       module.__mod__.__fns__.
                       InnerPrivate.displayName )
          
          assertEqual( "Outer#InnerPrivate#aMethod",
                       module.__mod__.__fns__.
                       InnerPrivate.__mod__.__fns__.
                       aMethod.displayName )
        })
        
        it("returns the name of a deeply nested module", function() {
          assertEqual( "Outer#InnerPrivate.DeepInner",
                       module.__mod__.__fns__.
                       InnerPrivate.DeepInner.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner#aMethod",
                       module.__mod__.__fns__.
                       InnerPrivate.DeepInner.__mod__.__fns__.
                       aMethod.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner.Foo",
                       module.__mod__.__fns__.
                       InnerPrivate.DeepInner.
                       Foo.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner.Foo#aMethod",
                       module.__mod__.__fns__.
                       InnerPrivate.DeepInner.
                       Foo.__mod__.__fns__.
                       aMethod.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner#Klass",
                       module.__mod__.__fns__.
                       InnerPrivate.DeepInner.__mod__.__fns__.
                       Klass.displayName )
          
          assertEqual( "Outer#InnerPrivate.DeepInner#Klass#aMethod",
                       module.__mod__.__fns__.
                       InnerPrivate.DeepInner.__mod__.__fns__.
                       Klass.__mod__.__fns__.
                       aMethod.displayName )
        })
      })
    })
  })
  
  before(function() {
    this.subjectClass = JS.Module
  })
  
  behavesLike("module")
  
  describe("#ancestors", function() {
    before(function() {
      this.module = new JS.Module()
    })
    
    describe("with no included modules", function() {
      it("returns the receiver", function() {
        assertEqual( [module], module.ancestors() )
      })
    })
    
    describe("with an included module", function() {
      before(function() {
        module.include(modA)
      })
      
      it("returns the included module and the receiver", function() {
        assertEqual( [modA, module], module.ancestors() )
      })
    })
    
    describe("with two included modules", function() {
      before(function() {
        module.include(modC)
        module.include(modD)
      })
      
      it("sorts the modules by inclusion order", function() {
        assertEqual( [modC, modD, module], module.ancestors() )
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
        assertEqual( [modA, modB, module], module.ancestors() )
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
          assertEqual( [modA, modB, modC, module], module.ancestors() )
        })
      })
    })
  })
})

