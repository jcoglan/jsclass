JS.ENV.ComparableSpec = JS.Test.describe(JS.Comparable, function() {
  include(JS.Test.Helpers)
  
  define("TodoItem", new JS.Class({
      include: JS.Comparable,
      initialize: function(position, task) {
          this.position = position;
          this.task = task || "";
      },
      compareTo: function(other) {
          if (this.position < other.position)
              return -1;
          else if (this.position > other.position)
              return 1;
          else
              return 0;
      }
  }))
  
  describe("sorting", function() {
    before(function() {
      this.todos = map([8,2,7,5,3,7,6], function(id) { return new TodoItem(id) })
    })
    
    it("uses the #compareTo method to sort", function() {
      todos.sort(TodoItem.compare)
      assertEqual( [2,3,5,6,7,7,8], map(todos, 'position') )
    })
  })
  
  describe("#lt", function() {
    it("returns true if A < B", function() {
      assert( new TodoItem(1).lt(new TodoItem(2)) )
    })
    
    it("returns false if A = B", function() {
      assert( !new TodoItem(2).lt(new TodoItem(2)) )
    })
    
    it("returns false if A > B", function() {
      assert( !new TodoItem(3).lt(new TodoItem(2)) )
    })
  })
  
  describe("#lte", function() {
    it("returns true if A < B", function() {
      assert( new TodoItem(1).lte(new TodoItem(2)) )
    })
    
    it("returns true if A = B", function() {
      assert( new TodoItem(2).lte(new TodoItem(2)) )
    })
    
    it("returns false if A > B", function() {
      assert( !new TodoItem(3).lte(new TodoItem(2)) )
    })
  })
  
  describe("#eq", function() {
    it("returns false if A < B", function() {
      assert( !new TodoItem(1).eq(new TodoItem(2)) )
    })
    
    it("returns true if A = B", function() {
      assert( new TodoItem(2).eq(new TodoItem(2)) )
    })
    
    it("returns false if A > B", function() {
      assert( !new TodoItem(3).eq(new TodoItem(2)) )
    })
  })
  
  describe("#gt", function() {
    it("returns false if A < B", function() {
      assert( !new TodoItem(1).gt(new TodoItem(2)) )
    })
    
    it("returns false if A = B", function() {
      assert( !new TodoItem(2).gt(new TodoItem(2)) )
    })
    
    it("returns true if A > B", function() {
      assert( new TodoItem(3).gt(new TodoItem(2)) )
    })
  })
  
  describe("#gte", function() {
    it("returns false if A < B", function() {
      assert( !new TodoItem(1).gte(new TodoItem(2)) )
    })
    
    it("returns true if A = B", function() {
      assert( new TodoItem(2).gte(new TodoItem(2)) )
    })
    
    it("returns true if A > B", function() {
      assert( new TodoItem(3).gte(new TodoItem(2)) )
    })
  })
})

