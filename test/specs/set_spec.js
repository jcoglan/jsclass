SetSpec = JS.Test.describe(JS.Set, function() { with(this) {
  include(JS.Test.Helpers)
  
  define("assertSetEqual", function(expected, actual) {
    this.__wrapAssertion__(function() {
      this.assertKindOf( JS.Set, actual )
      if (expected.entries) expected = expected.entries()
      if (actual.entries)   actual   = actual.entries()
      this.assertEqual( expected.sort(), actual.sort() )
    })
  })
  
  before(function() { with(this) {
    this.a = new JS.HashSet([8,2,7,4,8,1])
    this.b = new JS.Set([3,5,6,9,2,8])
  }})
  
  describe("#size", function() { with(this) {
    it("counts the number of non-duplicate entries", function() { with(this) {
      assertEqual( 5, a.size )
      assertEqual( 6, b.size )
    }})
  }})
  
  describe("#remove", function() { with(this) {
    it("removes the specified member", function() { with(this) {
      a.remove(2)
      assertSetEqual( [8,7,4,1], a )
    }})
  }})
  
  describe("#removeIf", function() { with(this) {
    it("removes members for which the block returns true", function() { with(this) {
      a.removeIf(function(x) { return x % 2 === 0 })
      assertSetEqual( [7,1], a )
    }})
  }})
  
  describe("#subtract", function() { with(this) {
    it("removes members from the first if they appear in the second", function() { with(this) {
      a.subtract(b)
      assertSetEqual( [7,4,1], a )
    }})
  }})
  
  describe("#union", function() { with(this) {
    it("returns a set of the same type as the receiver", function() { with(this) {
      assertEqual( JS.HashSet, a.u(b).klass )
      assertEqual( JS.Set, b.u(a).klass )
    }})
    
    it("returns a set containing all the members from both sets", function() { with(this) {
      assertSetEqual( [8,2,7,4,1,3,5,6,9], a.u(b) )
    }})
    
    it("is symmetric", function() { with(this) {
      assertSetEqual( a.u(b), b.u(a) )
    }})
  }})
  
  describe("#intersection", function() { with(this) {
    it("returns a set of the same type as the receiver", function() { with(this) {
      assertEqual( JS.HashSet, a.n(b).klass )
      assertEqual( JS.Set, b.n(a).klass )
    }})
    
    it("returns a set containing only members that appear in both sets", function() { with(this) {
      assertSetEqual( [8,2], a.n(b) )
    }})
    
    it("is symmetric", function() { with(this) {
      assertSetEqual( a.n(b), b.n(a) )
    }})
  }})
  
  describe("#product", function() { with(this) {
    before(function() { with(this) {
      this.k = new JS.SortedSet([1,2,3,4])
      this.l = new JS.SortedSet([5,6,7,8])
    }})
    
    it("returns a HashSet", function() { with(this) {
      assertEqual( JS.HashSet, a.x(b).klass )
      assertEqual( JS.HashSet, b.x(a).klass )
      assertEqual( JS.HashSet, k.x(l).klass )
    }})
    
    it("returns a set containing all possible pairs of members", function() { with(this) {
      assertEqual( [[1,5],[1,6],[1,7],[1,8],
                    [2,5],[2,6],[2,7],[2,8],
                    [3,5],[3,6],[3,7],[3,8],
                    [4,5],[4,6],[4,7],[4,8]], k.x(l).entries() )
    }})
  }})
  
  describe("#difference", function() { with(this) {
    it("returns a set of the same type as the receiver", function() { with(this) {
      assertEqual( JS.HashSet, a.difference(b).klass )
      assertEqual( JS.Set, b.difference(a).klass )
    }})
    
    it("returns a set of members from the first that are not in the second", function() { with(this) {
      assertSetEqual( [7,4,1], a.difference(b) )
      assertSetEqual( [3,5,6,9], b.difference(a) )
    }})
  }})
  
  describe("#complement", function() { with(this) {
    it("returns a set of the same type as the receiver", function() { with(this) {
      assertEqual( JS.HashSet, a.complement(b).klass )
      assertEqual( JS.Set, b.complement(a).klass )
    }})
    
    it("returns a set of members from the second that are not in the first", function() { with(this) {
      assertSetEqual( [3,5,6,9], a.complement(b) )
      assertSetEqual( [7,4,1], b.complement(a) )
    }})
  }})
  
  describe("#xor", function() { with(this) {
    it("returns a set of the same type as the receiver", function() { with(this) {
      assertEqual( JS.HashSet, a.xor(b).klass )
      assertEqual( JS.Set, b.xor(a).klass )
    }})
    
    it("returns a set of members that only appear in one set", function() { with(this) {
      assertSetEqual( [7,4,1,3,5,6,9], a.xor(b) )
    }})
    
    it("is symmetric", function() { with(this) {
      assertSetEqual( a.xor(b), b.xor(a) )
    }})
  }})
  
  describe("#classify", function() { with(this) {
    before(function() { with(this) {
      this.set = new JS.HashSet([1,9,2,8,3,7,4,6,5])
      this.classification = set.classify(function(x) { return x % 3 })
    }})
    
    it("returns a Hash of Sets", function() { with(this) {
      assertKindOf( JS.Hash, classification )
      assert( classification.all(function(pair) { return pair.value.isA(JS.Set) }) )
    }})
    
    it("returns Sets of the same type as the receiver", function() { with(this) {
      assertEqual( JS.HashSet, classification.get(0).klass )
      var sorted = new JS.SortedSet([1,2]).classify(function() { return 1 })
      assertEqual( JS.SortedSet, sorted.get(1).klass )
    }})
    
    it("classifies members by their return value for the block", function() { with(this) {
      assertSetEqual( [3,6,9], classification.get(0) )
      assertSetEqual( [1,4,7], classification.get(1) )
      assertSetEqual( [2,5,8], classification.get(2) )
    }})
  }})
  
  describe("#divide", function() { with(this) {
    before(function() { with(this) {
      this.set = new JS.HashSet([1,9,2,8,3,7,4,6,5])
      this.division = set.divide(function(x) { return x % 3 })
    }})
    
    it("returns a HashSet of sets of the same type as the receiver", function() { with(this) {
      var diva = a.divide(function(x) { return x % 3 })
      assertEqual( JS.HashSet, diva.klass )
      assert( diva.all(function(s) { return s.klass === JS.HashSet }) )
      
      var divb = b.divide(function(x) { return x % 3 })
      assertEqual( JS.HashSet, divb.klass )
      assert( divb.all(function(s) { return s.klass === JS.Set }) )
    }})
    
    it("returns a set of subsets grouped by the block's return value", function() { with(this) {
      assertEqual( 3, division.size )
      assert( division.contains(new JS.Set([9,3,6])) )
      assert( division.contains(new JS.Set([1,4,7])) )
      assert( division.contains(new JS.Set([2,5,8])) )
    }})
  }})
  
  describe("#equals", function() { with(this) {
    before(function() { with(this) {
      this.set     = new JS.Set(['j','s','c'])
      this.hashset = new JS.HashSet(['j','s','c'])
      this.sorted  = new JS.SortedSet(['j','s','c'])
      this.bigger  = new JS.Set(['j','s','c','g'])
      this.smaller = new JS.Set(['j','s'])
      this.diff    = new JS.SortedSet(['j','b','f'])
    }})
    
    it("returns true for sets with the same members", function() { with(this) {
      assertEqual( set,     hashset )
      assertEqual( set,     sorted  )
      assertEqual( hashset, sorted  )
    }})
    
    it("returns false for sets with different members", function() { with(this) {
      assertNotEqual( set,     bigger  )
      assertNotEqual( hashset, smaller )
      assertNotEqual( sorted,  diff    )
    }})
  }})
  
  describe("containing objects", function() { with(this) {
    before(function() { with(this) {
      this.set = new JS.HashSet()
    }})
    
    it("rejects equal objects", function() { with(this) {
      set.add( new JS.HashSet )
      set.add( new JS.Set )
      assertSetEqual( [new JS.Set], set )
    }})
    
    it("accepts non-equal objects", function() { with(this) {
      set.add( new JS.HashSet )
      set.add( new JS.Set([12]) )
      assertEqual( 2, set.entries().length )
      assert( set.contains(new JS.HashSet) )
      assert( set.contains(new JS.Set([12])) )
    }})
    
    describe("#remove", function() { with(this) {
      before(function() { with(this) {
        set.add( new JS.HashSet )
        set.add( new JS.Set([12]) )
      }})
      
      it("removes objects that equal the argument", function() { with(this) {
        set.remove( new JS.Set )
        assertEqual( 1, set.size )
        assert( set.contains(new JS.Set([12])) )
      }})
      
      it("does not remove objects that do not equal the argument", function() { with(this) {
        set.remove( new JS.Set([6]) )
        assertEqual( 2, set.size )
      }})
    }})
    
    it("handles native JavaScript types", function() { with(this) {
      set.add([1,2,3])
      set.add([4,5,6])
      set.add([1,2,3])
      assertEqual( 2, set.entries().length )
      assert( set.contains([4,5,6]) )
      assert( set.contains([1,2,3]) )
    }})
  }})
  
  describe("#flatten", function() { with(this) {
    before(function() { with(this) {
      this.list     = [9,3,7,8,4]
      this.sorted   = new JS.SortedSet(['fred', 'baz'])
      this.nested   = new JS.HashSet([5, sorted])
      this.hashset  = new JS.HashSet([45,'twelve'])
      
      this.set      = new JS.HashSet([4, 'foo', nested, 12, hashset])
      this.withList = new JS.Set([4,13,list])
    }})
    
    it("flattens nested sets", function() { with(this) {
      set.flatten()
      assertSetEqual( [4,'foo',5,'fred','baz',12,45,'twelve'], set )
    }})
    
    it("leaves arrays intact", function() { with(this) {
      withList.flatten()
      assertSetEqual( [4,13,list], withList )
    }})
  }})
  
  describe("comparators", function() { with(this) {
    before(function() { with(this) {
      this.alice = new JS.HashSet([4,2,5])
      this.bob   = new JS.Set([6,4,5,2,3])
      this.cecil = new JS.SortedSet([5,2,4])
    }})
    
    describe("#isSubset", function() { with(this) {
      it("returns true if first is a proper subset of the second", function() { with(this) {
        assert( alice.isSubset(bob) )
      }})
      it("returns true if first is an improper subset of the second", function() { with(this) {
        assert( alice.isSubset(cecil) )
      }})
      it("returns false if first is a proper superset of the second", function() { with(this) {
        assert( !bob.isSubset(alice) )
      }})
    }})
    
    describe("#isProperSubset", function() { with(this) {
      it("returns true if first is a proper subset of the second", function() { with(this) {
        assert( alice.isProperSubset(bob) )
      }})
      it("returns false if first is an improper subset of the second", function() { with(this) {
        assert( !alice.isProperSubset(cecil) )
      }})
      it("returns false if first is a proper superset of the second", function() { with(this) {
        assert( !bob.isProperSubset(alice) )
      }})
    }})
    
    describe("#isSuperset", function() { with(this) {
      it("returns true if first is a proper superset of the second", function() { with(this) {
        assert( bob.isSuperset(alice) )
      }})
      it("returns true if first is an improper superset of the second", function() { with(this) {
        assert( alice.isSuperset(cecil) )
      }})
      it("returns false if first is a proper subset of the second", function() { with(this) {
        assert( !alice.isSuperset(bob) )
      }})
    }})
    
    describe("#isProperSuperset", function() { with(this) {
      it("returns true if first is a proper superset of the second", function() { with(this) {
        assert( bob.isProperSuperset(alice) )
      }})
      it("returns false if first is an improper superset of the second", function() { with(this) {
        assert( !alice.isProperSuperset(cecil) )
      }})
      it("returns false if first is a proper subset of the second", function() { with(this) {
        assert( !alice.isProperSuperset(bob) )
      }})
    }})
  }})
  
  describe("SortedSet", function() { with(this) {
    before(function() { with(this) {
      this.a = new JS.SortedSet([8,3,6,1])
      this.b = new JS.HashSet([2,9,7,4])
      
      this.TodoItem = new JS.Class({
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
      })
    }})
    
    it("keeps its members sorted", function() { with(this) {
      // Run test a few times with random data
      repeat(10, function() {
        // make a list of unique random numbers
        var list    = $R(1,20).map(function() { return Math.round(Math.random() * 100) }),
            uniques = new JS.HashSet(list).entries()
        
        assertNotEqual( [], uniques )
        
        var sorted  = new JS.SortedSet(list).entries()
        uniques.sort(function(a,b) { return a - b })
        assertEqual( uniques, sorted )
      })
    }})
    
    describe("containing homogenous values", function() { with(this) {
      before(function() { with(this) {
        this.set = new JS.SortedSet()
        $R(1,20).forEach(function(position) { set.add(new TodoItem(position%4)) })
      }})
      
      it("keeps the members sorted", function() { with(this) {
        assertEqual( [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3], set.map('position') )
      }})
    }})
    
    describe("#union", function() { with(this) {
      it("returns a SortedSet", function() { with(this) {
        assertKindOf( JS.SortedSet, a.u(b) )
      }})
      
      it("returns the members in order", function() { with(this) {
        assertEqual( [1,2,3,4,6,7,8,9], a.u(b).entries() )
      }})
    }})
    
    describe("containing objects", function() { with(this) {
      it("sorts the objects", function() { with(this) {
        var set = new JS.SortedSet()
        forEach([4,3,5,1,2], function(position) {
          set.add(new TodoItem(position))
        })
        assertEqual( [1,2,3,4,5], set.map('position') )
      }})
    }})
  }})
}})

