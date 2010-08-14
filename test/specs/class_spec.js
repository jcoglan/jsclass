ClassSpec = JS.Test.describe(JS.Class, function() {
  before(function() {
    this.subjectClass = JS.Class
  })
  
  behavesLike("module")
  
  describe("#ancestors", function() {
    before(function() {
      this.module = new JS.Class()
    })
    
    describe("with no included modules", function() {
      it("returns the receiver", function() {
        assertEqual( [JS.Kernel, module], module.ancestors() )
      })
    })
    
    describe("with an included module", function() {
      before(function() {
        module.include(modA)
      })
      
      it("returns the included module and the receiver", function() {
        assertEqual( [JS.Kernel, modA, module], module.ancestors() )
      })
    })
    
    describe("with two included modules", function() {
      before(function() {
        module.include(modC)
        module.include(modD)
      })
      
      it("sorts the modules by inclusion order", function() {
        assertEqual( [JS.Kernel, modC, modD, module], module.ancestors() )
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
        assertEqual( [JS.Kernel, modA, modB, module], module.ancestors() )
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
          assertEqual( [JS.Kernel, modA, modB, modC, module], module.ancestors() )
        })
      })
    })
  })
})

