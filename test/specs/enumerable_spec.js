PKG.require('JS.Comparable', 'JS.Enumerable', 'JS.Enumerator', 'JS.Hash', 'JS.Range',
function(Comparable, Enumerable, Enumerator, Hash, Range) {

JS.ENV.EnumerableSpec = JS.Test.describe(Enumerable, function() { with(this) {
  include(JS.Test.Helpers)

  var List = new JS.Class("List", {
      include: Enumerable,

      initialize: function(members) {
          this._members = []
          for (var i = 0, n = members.length; i < n; i++)
              this._members.push(members[i])
      },

      forEach: function(block, context) {
          if (!block) return this.enumFor("forEach")
          var members = this._members
          for (var i = 0, n = members.length; i < n; i++)
              block.call(context, members[i])
      }
  })

  define("list", function() {
    return new List(arguments)
  })

  define("assertEnumFor", function(object, method, args, actual) {
    this.__wrapAssertion__(function() {
      this.assertKindOf( Enumerator, actual )
      var enumerator = new Enumerator(object, method, args)
      this.assertEqual( enumerator, actual )
    })
  })

  before(function() { with(this) {
    this.items = list(1,2,3,4,5,6)
    this.odd   = function(x) { return x % 2 === 1 }
    this.lt4   = function(x) { return x < 4 }
    this.eq3   = function(x) { return x === 3 }
    this.lt10  = function(x) { return x < 10 }
    this.gt10  = function(x) { return x > 10 }
  }})

  describe("#all", function() { with(this) {
    describe("without a block", function() { with(this) {
      it("returns true for an empty collection", function() { with(this) {
        assert( list().all() )
      }})

      it("returns true if the collection contains no falsey items", function() { with(this) {
        assert( list(1,2,3,4).all() )
      }})

      it("returns false if the collection contains a falsey item", function() { with(this) {
        assert( !list(1,2,3,4,0).all() )
      }})
    }})

    describe("with a block", function() { with(this) {
      it("returns true if all the items return true for the block", function() { with(this) {
        assert( items.all(lt10) )
      }})

      it("returns false if any item returns false for the block", function() { with(this) {
        assert( !items.all(odd) )
      }})
    }})

    describe("with a block and a context", function() { with(this) {
      before(function() { with(this) {
        this.context = {factor: 12}
      }})

      it("returns true if all the items return true for the block", function() { with(this) {
        assert( items.all(function(x) { return x < this.factor }, context) )
      }})

      it("returns false if any item returns false for the block", function() { with(this) {
        assert( !items.all(function(x) { return x > this.factor }, context) )
      }})
    }})
  }})

  describe("#any", function() { with(this) {
    describe("without a block", function() { with(this) {
      it("returns false for an empty collection", function() { with(this) {
        assert( !list().any() )
      }})

      it("returns true if the collection contains a truthy item", function() { with(this) {
        assert( list(0,false,null,1).any() )
      }})

      it("returns false if the collection does not contain a truthy item", function() { with(this) {
        assert( !list(0,false,null,"").any() )
      }})
    }})

    describe("with a block", function() { with(this) {
      it("returns false if none of the items returns true for the block", function() { with(this) {
        assert( !items.any(gt10) )
      }})

      it("returns true if any item returns true for the block", function() { with(this) {
        assert( items.any(odd) )
      }})
    }})

    describe("with a block and a context", function() { with(this) {
      before(function() { with(this) {
        this.context = {factor: 12}
      }})

      it("returns false if none of the items returns true for the block", function() { with(this) {
        assert( !items.any(function(x) { return x > this.factor }, context) )
      }})

      it("returns true if any item returns true for the block", function() { with(this) {
        assert( items.any(function(x) { return x < this.factor }, context) )
      }})
    }})
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
      items.size = function() { return "fromSize" }
      assertEqual( "fromSize", items.count() )
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

    it("returns an enumerator if called with no block", function() { with(this) {
      var collection = list(1,2,3)
      assertEnumFor( collection, "cycle", [2], collection.cycle(2) )
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
      assertEqual( [[],[1],[],[2]], list([3],[4],[],[1],[],[2]).dropWhile("length") )
      assertEqual( $w("can stay"), list("longer", "words", "can", "stay").dropWhile(its().substring(3)) )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "dropWhile", [], items.dropWhile() )
    }})
  }})

  describe("#find", function() { with(this) {
    it("returns the first item matching the block", function() { with(this) {
      assertEqual( 1, items.find(odd) )
      assertEqual( 3, items.find(eq3) )
    }})

    it("returns null if no item matches", function() { with(this) {
      assertNull( items.find(gt10) )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "find", [], items.find() )
    }})
  }})

  describe("#findIndex", function() { with(this) {
    it("return the index of the first item matching the value", function() { with(this) {
      assertEqual( 0, items.findIndex(1) )
      assertEqual( 3, items.findIndex(4) )
    }})

    it("returns the index of the first item matching the block", function() { with(this) {
      assertEqual( 0, items.findIndex(odd) )
      assertEqual( 2, items.findIndex(eq3) )
    }})

    it("returns null if no element matches", function() { with(this) {
      assertNull( items.findIndex(20) )
    }})
  }})

  describe("#first", function() { with(this) {
    it("returns the first item when called with no argument", function() { with(this) {
      assertEqual( 1, items.first() )
    }})

    it("returns the first n items when called with an argument", function() { with(this) {
      assertEqual( [1,2,3,4], items.first(4) )
      assertEqual( [1,2], items.first(2) )
    }})
  }})

  describe("#forEachCons", function() { with(this) {
    before(function() { with(this) {
      this.result = []
      this.push = function(group) { result.push(group) }
    }})

    it("iterates over each set of 2 consecutive items", function() { with(this) {
      items.forEachCons(2, push)
      assertEqual( [[1,2],[2,3],[3,4],[4,5],[5,6]], result )
    }})

    it("iterates over each set of 3 consecutive items", function() { with(this) {
      items.forEachCons(3, push)
      assertEqual( [[1,2,3],[2,3,4],[3,4,5],[4,5,6]], result )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "forEachCons", [5], items.forEachCons(5) )
    }})
  }})

  describe("#forEachSlice", function() { with(this) {
    before(function() { with(this) {
      this.result = []
      this.push = function(group) { result.push(group) }
    }})

    it("iterates over the collection in groups of 2", function() { with(this) {
      items.forEachSlice(2, push)
      assertEqual( [[1,2],[3,4],[5,6]], result )
    }})

    it("iterates over the collection in groups of 3", function() { with(this) {
      items.forEachSlice(3, push)
      assertEqual( [[1,2,3],[4,5,6]], result )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "forEachSlice", [4], items.forEachSlice(4) )
    }})
  }})

  describe("#forEachWithIndex", function() { with(this) {
    before(function() { with(this) {
      this.result = []
      this.push = function(item, i) { result.push([i,item]) }
    }})

    it("iterates with indexes", function() { with(this) {
      items.forEachWithIndex(push)
      assertEqual( [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]], result )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "forEachWithIndex", [0], items.forEachWithIndex() )
    }})
  }})

  describe("#forEachWithObject", function() { with(this) {
    before(function() { with(this) {
      this.result = {}
      this.push = function(obj, item) { obj[item] = item.length }
    }})

    it("builds an object by iterating on the collection", function() { with(this) {
      list("some","simple","words").forEachWithObject(result, push)
      assertEqual( {some: 4, simple: 6, words: 5}, result )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "forEachWithObject", [result], items.forEachWithObject(result) )
    }})
  }})

  describe("#grep", function() { with(this) {
    before(function() { with(this) {
      items = list(4, "hi", $w("foo bar"), true, new Range(3,7), null, Range, false)
    }})

    it("returns items that match the regex", function() { with(this) {
      assertEqual( ["food"], list("eat","your","food").grep(/foo/) )
    }})

    it("returns values of a given type", function() { with(this) {
      assertEqual( [true,false], items.grep(Boolean) )
      assertEqual( [4], items.grep(Number) )
      assertEqual( [Range], items.grep(JS.Class) )
      assertEqual( [new Range(3,7)], items.grep(Enumerable) )
    }})

    it("returns values within a given range", function() { with(this) {
      assertEqual( [3,4,5], list(2,3,4,7,5,9).grep(new Range(3,5)) )
    }})

    it("uses the block to modify the results", function() { with(this) {
      assertEqual( [8], items.grep(Number, function(x) { return x*2 }) )
    }})
  }})

  describe("#groupBy", function() { with(this) {
    it("returns a hash", function() { with(this) {
      assertKindOf( Hash, items.groupBy(function(x) { return x % 3 }) )
    }})

    it("groups the items by their return value for the block", function() { with(this) {
      var hash = items.groupBy(function(x) { return x % 3 })
      assertEqual( [3,6], hash.get(0) )
      assertEqual( [1,4], hash.get(1) )
      assertEqual( [2,5], hash.get(2) )
      assertEqual( 3, hash.count() )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "groupBy", [], items.groupBy() )
    }})
  }})

  describe("#inject", function() { with(this) {
    describe("with no block context", function() { with(this) {
      it("takes an initial value and folds over the collection", function() { with(this) {
        assertEqual( 26, items.inject(5, function(m,x) { return m + x }) )
      }})

      it("uses the first item as the initial value if none is given", function() { with(this) {
        assertEqual( 21, items.inject(function(m,x) { return m + x }) )
      }})

      it("accepts a blockish", function() { with(this) {
        assertEqual( 720, items.inject("*") )
        assertEqual( 1440, items.inject(2,"*") )
        assertEqual( 42, list("A","B","C","D").inject({A:{B:{C:{D:42}}}}, "[]") )
      }})

      describe("on an object starting value", function() { with(this) {
        before(function() { with(this) {
          this.tree = new Hash(["A", new Hash(["B", new Hash(["C", "hi"])])])
        }})

        it("accepts a method name to inject between values", function() { with(this) {
          // like calling tree.get("A").get("B").get("C")
          assertEqual( "hi", list("A","B","C").inject(tree, "get") )
        }})
      }})
    }})

    describe("with a block context", function() { with(this) {
      before(function() { with(this) {
        this.context = {factor: 10}
      }})

      it("takes an initial value and folds over the collection", function() { with(this) {
        assertEqual( 215, items.inject(5, function(m,x) { return m + this.factor*x }, context) )
      }})

      it("uses the first item as the initial value if none is given", function() { with(this) {
        // first item does not get multiplied
        assertEqual( 201, items.inject(function(m,x) { return m + this.factor*x }, context) )
      }})
    }})
  }})

  describe("#map", function() { with(this) {
    it("returns an array by applying the block to each item in the collection", function() { with(this) {
      assertEqual( [1,4,9,16,25,36], items.map(function(x) { return x*x }) )
    }})

    it("accepts a blockish", function() { with(this) {
      assertEqual( [4,6,5], list("some","simple","words").map("length") )
      assertEqual( $w("4 a 18"), list(4,10,24).map(its().toString(16).toLowerCase()) )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "map", [], items.map() )
      assertEqual( $w("10 21 32 43 54 65"), items.map().withIndex(function(x,i) { return String(x) + i }) )
    }})
  }})

  describe("#member", function() { with(this) {
    it("returns true if the collection contains the item", function() { with(this) {
      assert( items.member(4) )
    }})

    it("returns false if the collection does not contain the item", function() { with(this) {
      assert( !items.member('4') )
      assert( !items.member(12) )
    }})
  }})

  describe("#none", function() { with(this) {
    describe("without a block", function() { with(this) {
      it("returns true for an empty collection", function() { with(this) {
        assert( list().none() )
      }})

      it("returns true if the collection contains no truthy items", function() { with(this) {
        assert( list(0,null,"",false).none() )
      }})

      it("returns false if the collection contains a truthy item", function() { with(this) {
        assert( !list(0,null,"",false,true).none() )
      }})
    }})

    describe("with a block", function() { with(this) {
      it("returns true if all the items return false for the block", function() { with(this) {
        assert( items.none(gt10) )
      }})

      it("returns false if any item returns true for the block", function() { with(this) {
        assert( !items.none(odd) )
      }})
    }})

    describe("with a block and a context", function() { with(this) {
      before(function() { with(this) {
        this.context = {factor: 12}
      }})

      it("returns true if all the items return false for the block", function() { with(this) {
        assert( items.none(function(x) { return x > this.factor }, context) )
      }})

      it("returns false if any item returns true for the block", function() { with(this) {
        assert( !items.none(function(x) { return x < this.factor }, context) )
      }})
    }})
  }})

  describe("#one", function() { with(this) {
    describe("without a block", function() { with(this) {
      it("returns false for an empty collection", function() { with(this) {
        assert( !list().one() )
      }})

      it("returns true if the collection contains one truthy item", function() { with(this) {
        assert( list(0,false,null,1).one() )
      }})

      it("returns false if the collection contains many truthy items", function() { with(this) {
        assert( !list(0,false,null,1,true).one() )
      }})
    }})

    describe("with a block", function() { with(this) {
      it("returns false if many of the items returns true for the block", function() { with(this) {
        assert( !items.one(odd) )
      }})

      it("returns true if one item returns true for the block", function() { with(this) {
        assert( items.one(eq3) )
      }})
    }})

    describe("with a block and a context", function() { with(this) {
      before(function() { with(this) {
        this.context = {factor: 4}
      }})

      it("returns false if many of the items returns true for the block", function() { with(this) {
        assert( !items.one(function(x) { return x > this.factor }, context) )
      }})

      it("returns true if one item returns true for the block", function() { with(this) {
        assert( items.one(function(x) { return x === this.factor }, context) )
      }})
    }})
  }})

  describe("#reject", function() { with(this) {
    it("returns an array", function() { with(this) {
      assertKindOf( Array, items.reject(odd) )
    }})

    it("returns all the items that do not match the block", function() { with(this) {
      assertEqual( [2,4,6], items.reject(odd) )
      assertEqual( [4,5,6], items.reject(lt4) )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "reject", [], items.reject() )
      assertEqual( [5,9], list(7,2,8,5,9).reject().withIndex(function(x,i) { return i < 3 }) )
      assertEqual( [5,9], list(7,2,8,5,9).forEachWithIndex().reject(function(x,i) { return i < 3 }) )
    }})
  }})

  describe("#reverseForEach", function() { with(this) {
    before(function() { with(this) {
      this.result = []
      this.push = function(x) { result.push(x) }
    }})

    it("iterates over the collection in reverse order", function() { with(this) {
      items.reverseForEach(push)
      assertEqual( [6,5,4,3,2,1], result )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "reverseForEach", [], items.reverseForEach() )
    }})
  }})

  describe("#select", function() { with(this) {
    it("returns an array", function() { with(this) {
      assertKindOf( Array, items.select(odd) )
    }})

    it("returns all the items that match the block", function() { with(this) {
      assertEqual( [1,3,5], items.select(odd) )
      assertEqual( [1,2,3], items.select(lt4) )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "select", [], items.select() )
      assertEqual( [7,2,8], list(7,2,8,5,9).select().withIndex(function(x,i) { return i < 3 }) )
      assertEqual( [7,2,8], list(7,2,8,5,9).forEachWithIndex().select(function(x,i) { return i < 3 }) )
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

  describe("#partition", function() { with(this) {
    before(function() { with(this) {
      this.lists = items.partition(odd)
    }})

    it("returns two arrays", function() { with(this) {
      assertKindOf( Array, lists )
      assertEqual( 2, lists.length )
    }})

    it("returns a list of items that match the block in the first list", function() { with(this) {
      assertEqual( [1,3,5], lists[0] )
    }})

    it("returns a list of items that did not match the block in the second list", function() { with(this) {
      assertEqual( [2,4,6], lists[1] )
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
      assertEqual( [[3],[4]], list([3],[4],[],[1],[],[2]).takeWhile("length") )
      assertEqual( $w("longer words"), list("longer", "words", "can", "stay").takeWhile(its().substring(3)) )
    }})

    it("returns an enumerator if called with no block", function() { with(this) {
      assertEnumFor( items, "takeWhile", [], items.takeWhile() )
    }})
  }})

  describe("#toArray", function() { with(this) {
    it("returns the items as an array", function() { with(this) {
      assertEqual( [1,2,3,4,5,6], items.toArray() )
      assertEqual( [1,2,3,4,5,6], items.entries() )
    }})
  }})

  describe("#zip", function() { with(this) {
    describe("with an equal size list", function() { with(this) {
      it("returns an array", function() { with(this) {
        assertKindOf( Array, items.zip([5,6,7,8,9,0]) )
      }})

      it("returns a zipped list of the items of the inputs", function() { with(this) {
        assertEqual( [[1,5],[2,6],[3,7],[4,8],[5,9],[6,0]], items.zip([5,6,7,8,9,0]) )
      }})
    }})

    describe("with a block", function() { with(this) {
      before(function() { with(this) {
        this.result = []
        this.push = function(x) { result.push(x) }
      }})

      it("does not return anything", function() { with(this) {
        assert( !items.zip([5,6,7,8,9,0], push) )
      }})

      it("iterates over the zipped items", function() { with(this) {
        items.zip([5,6,7,8,9,0], push)
        assertEqual( [[1,5],[2,6],[3,7],[4,8],[5,9],[6,0]], result )
      }})
    }})

    describe("with a block and a context", function() { with(this) {
      before(function() { with(this) {
        this.context = []
        this.push = function(x) { this.push(x) }
      }})

      it("does not return anything", function() { with(this) {
        assert( !items.zip([5,6,7,8,9,0], push, context) )
      }})

      it("iterates over the zipped items", function() { with(this) {
        items.zip([5,6,7,8,9,0], push, context)
        assertEqual( [[1,5],[2,6],[3,7],[4,8],[5,9],[6,0]], context )
      }})
    }})

    describe("with unequally sized lists", function() { with(this) {
      it("returns an array", function() { with(this) {
        assertKindOf( Array, items.zip([8,2,7,6], $w("dog cat mouse")) )
      }})

      it("fills blank spots with null", function() { with(this) {
        assertEqual( [ [1,8,"dog"], [2,2,"cat"], [3,7,"mouse"], [4,6,null],
                       [5,null,null], [6,null,null] ],
                     items.zip([8,2,7,6], $w("dog cat mouse")) )
      }})
    }})
  }})

  describe("sorting methods", function() { with(this) {
    define("TodoItem", new JS.Class({
        include: Comparable,
        initialize: function(position, task) {
            this.position = position
            this.task = task || ""
        },
        compareTo: function(other) {
            if (this.position < other.position)
                return -1
            else if (this.position > other.position)
                return 1
            else
                return 0
        }
    }))

    before(function() { with(this) {
      this.items = list(7,2,9,3,5)
      this.todos = new List(items.map(function(x) { return new TodoItem(x) }))
      this.context = {methodName: "position"}
    }})

    describe("#max", function() { with(this) {
      it("returns the largest value in the collection", function() { with(this) {
        assertEqual( 9, items.max() )
      }})

      it("returns the largest object in the collection", function() { with(this) {
        assertKindOf( TodoItem, todos.max() )
        assertEqual( 9, todos.max().position )
      }})

      it("accepts a sorting block", function() { with(this) {
        assertEqual( 5, items.max(function(a,b) { return a%7 - b%7 }) )
      }})

      it("accepts a block context", function() { with(this) {
        assertEqual( 9, todos.max(function(a,b) { return a[this.methodName] - b[this.methodName] }, context).position )
      }})
    }})

    describe("#maxBy", function() { with(this) {
      it("returns the value with the highest return value for the block", function() { with(this) {
        assertEqual( 5, items.maxBy(function(x) { return x%7 }) )
      }})

      it("accepts a blockish for comparison", function() { with(this) {
        assertEqual( 9, todos.maxBy("position").position )
      }})

      it("accepts a block context", function() { with(this) {
        assertEqual( 9, todos.maxBy(function(x) { return x[this.methodName] }, context).position )
      }})

      it("returns an enumerator if called with no block", function() { with(this) {
        assertEnumFor( items, "maxBy", [], items.maxBy() )
      }})
    }})

    describe("#min", function() { with(this) {
      it("returns the smallest value in the collection", function() { with(this) {
        assertEqual( 2, items.min() )
      }})

      it("returns the smallest object in the collection", function() { with(this) {
        assertKindOf( TodoItem, todos.min() )
        assertEqual( 2, todos.min().position )
      }})

      it("accepts a sorting block", function() { with(this) {
        assertEqual( 7, items.min(function(a,b) { return a%7 - b%7 }) )
      }})

      it("accepts a block context", function() { with(this) {
        assertEqual( 2, todos.min(function(a,b) { return a[this.methodName] - b[this.methodName] }, context).position )
      }})
    }})

    describe("#minBy", function() { with(this) {
      it("returns the value with the lowest return value for the block", function() { with(this) {
        assertEqual( 7, items.minBy(function(x) { return x%7 }) )
      }})

      it("accepts a blockish for comparison", function() { with(this) {
        assertEqual( 2, todos.minBy("position").position )
      }})

      it("accepts a block context", function() { with(this) {
        assertEqual( 2, todos.minBy(function(x) { return x[this.methodName] }, context).position )
      }})

      it("returns an enumerator if called with no block", function() { with(this) {
        assertEnumFor( items, "minBy", [], items.minBy() )
      }})
    }})

    describe("#sort", function() { with(this) {
      it("sorts values", function() { with(this) {
        assertEqual( [2,3,5,7,9], items.sort() )
      }})

      it("sorts values using a comparison function", function() { with(this) {
        assertEqual( [9,7,5,3,2], items.sort(function(a,b) { return 1/a - 1/b }) )
      }})

      it("sorts objects with #compareTo", function() { with(this) {
        assertEqual( [2,3,5,7,9], map(todos.sort(), "position") )
      }})
    }})

    describe("#sortBy", function() { with(this) {
      it("sorts items by their return value for the block", function() { with(this) {
        assertEqual( [9,7,5,3,2], items.sortBy(function(x) { return 1/x }) )
      }})

      it("accepts a blockish", function() { with(this) {
        assertEqual( [2,3,5,7,9], map(todos.sortBy("position"), "position") )
      }})

      it("returns an enumerator if called with no block", function() { with(this) {
        assertEnumFor( items, "sortBy", [], items.sortBy() )
      }})
    }})
  }})

  }})

})

