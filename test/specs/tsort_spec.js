TSortSpec = JS.Test.describe(JS.TSort, function() {
  before(function() {
    this.Hash = new JS.Class(JS.Hash, {
      include: JS.TSort,
      
      tsortEachNode: function(block, context) {
        return this.forEachKey(block, context)
      },
      
      tsortEachChild: function(node, block, context) {
        var list = this.fetch(node);
        for (var i = 0, n = list.length; i < n; i++)
          block.call(context, list[i]);
      }
    })
  })
  
  describe("with primitive data", function() {
    describe("with no cycles", function() {
      before(function() {
        this.hash = new Hash([ 1, [2,3],
          2, [3],
          3, [],
          4, [] ])
        })
        
      it("sorts the elements topologically", function() {
        assertEqual( [3,2,1,4], hash.tsort() )
      })
      
      it("identifies strongly connected nodes", function() {
        assertEqual( [[3],[2],[1],[4]], hash.stronglyConnectedComponents() )
      })
    })
    
    describe("when there are cycles", function() {
      before(function() {
        this.hash = new Hash([ 1, [2,3,4],
          2, [3],
          3, [2],
          4, [1] ])
        })
        
      it("raises an error", function() {
        assertThrows(JS.TSort.Cyclic, function() { hash.tsort() })
      })
      
      it("identifies strongly connected nodes", function() {
        assertEqual( [[2,3],[1,4]], hash.stronglyConnectedComponents() )
      })
    })
  })
  
  describe("with object data", function() {
    include(JS.Test.Helpers)
    
    before(function() {
      this.TodoItem = new JS.Class("TodoItem", {
        initialize: function(priority) {
          this.priority = priority
        },
        equals: function(other) {
          return this.priority == other.priority
        },
        hash: function() {
          return this.priority
        }
      })
    })
    
    describe("with no cycles", function() {
      before(function() {
        this.hash = new Hash([ new TodoItem(1), [new TodoItem(2),new TodoItem(3)],
          new TodoItem(2), [new TodoItem(3)],
          new TodoItem(3), [],
          new TodoItem(4), [] ])
        })
        
      it("sorts the elements topologically", function() {
        assertEqual( [3,2,1,4], map(hash.tsort(), "priority") )
      })
      
      it("identifies strongly connected nodes", function() {
        assertEqual( [[new TodoItem(3)],[new TodoItem(2)],[new TodoItem(1)],[new TodoItem(4)]],
                     hash.stronglyConnectedComponents() )
      })
    })
  })
})

