EnumerableSpec = JS.Test.describe(JS.Enumerable, function() { with(this) {
  include(JS.Test.Helpers)
  
  var List = new JS.Class("List", {
    include: JS.Enumerable,
    
    initialize: function(members) {
      this._members = [];
      for (var i = 0, n = members.length; i < n; i++)
        this._members.push(members[i]);
    },
    
    forEach: function(block, context) {
      if (!block) return this.enumFor('forEach');
      var members = this._members;
      for (var i = 0, n = members.length; i < n; i++)
        block.call(context, members[i], i);
    }
  })
  
  def("list", function() {
    return new List(arguments)
  })
  
  before(function() { with(this) {
    this.items = list(1,2,3,4,5,6)
    this.odd = function(x) { return x % 2 === 1 }
    this.lt4 = function(x) { return x < 4 }
  }})
  
  describe("#count", function() { with(this) {
    before(function() { with(this) {
      this.items = list(4,8,2,4,7)
    }})
    
    it("returns the number of items in the collection", function() { with(this) {
      assertEqual( 0, list().count() )
      assertEqual( 1, list(6).count() )
      assertEqual( 5, list(0,8,1,5,0).count() )
    }})
    
    it("counts the number of matching items in the collection", function() { with(this) {
      assertEqual( 2, items.count(4) )
      assertEqual( 1, items.count(7) )
      assertEqual( 0, items.count(9) )
    }})
    
    it("counts the items matching a block", function() { with(this) {
      assertEqual( 0, items.count(function(x) { return x % 3 === 0 }) )
      assertEqual( 4, items.count(function(x) { return x % 2 === 0 }) )
      assertEqual( 3, items.count(function(x) { return x % 4 === 0 }) )
    }})
    
    it("uses the object's #size method", function() { with(this) {
      items.size = function() { return 'fromSize' }
      assertEqual( 'fromSize', items.count() )
    }})
  }})
  
  describe("#cycle", function() { with(this) {
    before(function() { with(this) {
      this.result = []
      this.push = function(x) { result.push(x) }
    }})
    
    it("iterates over the collection n times", function() { with(this) {
      list(1,2,3,4,5).cycle(2, push)
      assertEqual( [1,2,3,4,5,1,2,3,4,5], result )
    }})
  }})
  
  describe("#drop", function() { with(this) {
    it("returns an array", function() { with(this) {
      assertKindOf( Array, items.drop(3) )
    }})
    
    it("returns all but the first n items from the collection", function() { with(this) {
      assertEqual( [4,5,6], items.drop(3) )
    }})
    
    it("returns the whole list for non-positive input", function() { with(this) {
      assertEqual( [1,2,3,4,5,6], items.drop(0) )
      assertEqual( [1,2,3,4,5,6], items.drop(-1) )
    }})
    
    it("returns an empty list for high input", function() { with(this) {
      assertEqual( [], items.drop(8) )
    }})
  }})
  
  describe("#dropWhile", function() { with(this) {
    it("returns an array", function() { with(this) {
      assertKindOf( Array, items.dropWhile(odd) )
    }})
    
    it("drops the items until one matches the block", function() { with(this) {
      assertEqual( [2,3,4,5,6], items.dropWhile(odd) )
      assertEqual( [4,5,6], items.dropWhile(lt4) )
    }})
    
    it("accepts a blockish", function() { with(this) {
      assertEqual( [[],[1],[],[2]], list([3],[4],[],[1],[],[2]).dropWhile('length') )
      assertEqual( $w('can stay'), list('longer', 'words', 'can', 'stay').dropWhile(its().substring(3)) )
    }})
  }})

  
  describe("#take", function() { with(this) {
    it("returns an array", function() { with(this) {
      assertKindOf( Array, items.take(3) )
    }})
    
    it("returns the first n items from the collection", function() { with(this) {
      assertEqual( [1,2,3], items.take(3) )
    }})
    
    it("returns an empty list for non-positive input", function() { with(this) {
      assertEqual( [], items.take(0) )
      assertEqual( [], items.take(-1) )
    }})
    
    it("returns the whole list for high input", function() { with(this) {
      assertEqual( [1,2,3,4,5,6], items.take(8) )
    }})
  }})
  
  describe("#takeWhile", function() { with(this) {
    it("returns an array", function() { with(this) {
      assertKindOf( Array, items.takeWhile(odd) )
    }})
    
    it("takes the items while they match the block", function() { with(this) {
      assertEqual( [1], items.takeWhile(odd) )
      assertEqual( [1,2,3], items.takeWhile(lt4) )
    }})
    
    it("accepts a blockish", function() { with(this) {
      assertEqual( [[3],[4]], list([3],[4],[],[1],[],[2]).takeWhile('length') )
      assertEqual( $w('longer words'), list('longer', 'words', 'can', 'stay').takeWhile(its().substring(3)) )
    }})
  }})
}})

