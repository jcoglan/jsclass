JS.require('JS.Set', 'JS.OrderedSet', 'JS.SortedSet', 'JS.Hash',
function(Set, OrderedSet, SortedSet, Hash) {

var sets = {
  Set:        Set,
  OrderedSet: OrderedSet,
  SortedSet:  SortedSet
}

JS.ENV.SetSpec = JS.Test.describe(sets.Set, function() { with(this) {
  include(JS.Test.Helpers)

  define("assertSetEqual", function(expected, actual) {
    this.__wrapAssertion__(function() {
      this.assertKindOf( sets.Set, actual )
      if (!(expected instanceof Array)) expected = expected.entries()
      if (!(actual instanceof Array))   actual = actual.entries()
      this.assertEqual( expected.sort(), actual.sort() )
    })
  })

  sharedBehavior("set", function() { with(this) {
    before(function() { with(this) {
      this.a = new Set([8,2,7,4,8,1])
      this.b = new Set([3,5,6,9,2,8])
    }})

    describe("#add", function() { with(this) {
      it("returns true if the given item is not in the set", function() { with(this) {
        assert( a.add(5) )
      }})

      it("returns false if the given item is already in the set", function() { with(this) {
        assert( !b.add(5) )
      }})

      it("adds the item to the set", function() { with(this) {
        a.add(5)
        assertSetEqual( [1,2,4,5,7,8], a )
      }})
    }})

    describe("#classify", function() { with(this) {
      before(function() { with(this) {
        this.set = new Set([1,9,2,8,3,7,4,6,5])
        this.classification = set.classify(function(x) { return x % 3 })
      }})

      it("returns a Hash of Sets", function() { with(this) {
        assertKindOf( Hash, classification )
        assert( classification.all(function(pair) { return pair.value.isA(sets.Set) }) )
      }})

      it("returns Sets of the same type as the receiver", function() { with(this) {
        assertEqual( Set, classification.get(0).klass )
      }})

      it("classifies members by their return value for the block", function() { with(this) {
        assertSetEqual( [3,6,9], classification.get(0) )
        assertSetEqual( [1,4,7], classification.get(1) )
        assertSetEqual( [2,5,8], classification.get(2) )
      }})
    }})

    describe("#complement", function() { with(this) {
      it("returns a set of the same type as the receiver", function() { with(this) {
        assertEqual( Set, a.complement(b).klass )
      }})

      it("returns a set of members from the second that are not in the first", function() { with(this) {
        assertSetEqual( [3,5,6,9], a.complement(b) )
        assertSetEqual( [7,4,1], b.complement(a) )
      }})
    }})

    describe("#difference", function() { with(this) {
      it("returns a set of the same type as the receiver", function() { with(this) {
        assertEqual( Set, a.difference(b).klass )
      }})

      it("returns a set of members from the first that are not in the second", function() { with(this) {
        assertSetEqual( [7,4,1], a.difference(b) )
        assertSetEqual( [3,5,6,9], b.difference(a) )
      }})
    }})

    describe("#divide", function() { with(this) {
      before(function() { with(this) {
        this.set = new Set([1,9,2,8,3,7,4,6,5])
        this.division = set.divide(function(x) { return x % 3 })
      }})

      it("returns a Set of sets of the same type as the receiver", function() { with(this) {
        var diva = a.divide(function(x) { return x % 3 })
        assertEqual( sets.Set, diva.klass )
        assert( diva.all(function(s) { return s.klass === Set }) )
      }})

      it("returns a set of subsets grouped by the block's return value", function() { with(this) {
        assertEqual( 3, division.size )
        assert( division.contains(new sets.Set([9,3,6])) )
        assert( division.contains(new sets.Set([1,4,7])) )
        assert( division.contains(new sets.Set([2,5,8])) )
      }})
    }})

    describe("#intersection", function() { with(this) {
      it("returns a set of the same type as the receiver", function() { with(this) {
        assertEqual( Set, a.n(b).klass )
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
        this.k = new sets.SortedSet([1,2,3,4])
        this.l = new sets.SortedSet([5,6,7,8])
      }})

      it("returns a Set", function() { with(this) {
        assertEqual( sets.Set, a.x(b).klass )
        assertEqual( sets.Set, b.x(a).klass )
        assertEqual( sets.Set, k.x(l).klass )
      }})

      it("returns a set containing all possible pairs of members", function() { with(this) {
        assertEqual( [[1,5],[1,6],[1,7],[1,8],
                      [2,5],[2,6],[2,7],[2,8],
                      [3,5],[3,6],[3,7],[3,8],
                      [4,5],[4,6],[4,7],[4,8]], k.x(l).entries() )
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

    describe("#size", function() { with(this) {
      it("counts the number of non-duplicate entries", function() { with(this) {
        assertEqual( 5, a.size )
        assertEqual( 6, b.size )
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
        assertEqual( Set, a.u(b).klass )
      }})

      it("returns a set containing all the members from both sets", function() { with(this) {
        assertSetEqual( [8,2,7,4,1,3,5,6,9], a.u(b) )
      }})

      it("is symmetric", function() { with(this) {
        assertSetEqual( a.u(b), b.u(a) )
      }})
    }})

    describe("#xor", function() { with(this) {
      it("returns a set of the same type as the receiver", function() { with(this) {
        assertEqual( Set, a.xor(b).klass )
      }})

      it("returns a set of members that only appear in one set", function() { with(this) {
        assertSetEqual( [7,4,1,3,5,6,9], a.xor(b) )
      }})

      it("is symmetric", function() { with(this) {
        assertSetEqual( a.xor(b), b.xor(a) )
      }})
    }})

    describe("comparators", function() { with(this) {
      before(function() { with(this) {
        this.alice = new Set([4,2,5])
        this.bob   = new Set([6,4,5,2,3])
        this.cecil = new Set([5,2,4])
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
  }})

  sharedBehavior("unsorted set", function() { with(this) {
    describe("#flatten", function() { with(this) {
      before(function() { with(this) {
        this.list     = [9,3,7,8,4]
        this.sorted   = new sets.SortedSet(['fred', 'baz'])
        this.nested   = new sets.Set([5, sorted])
        this.hashset  = new sets.Set([45,'twelve'])

        this.set      = new Set([4, 'foo', nested, 12, hashset])
        this.withList = new Set([4,13,list])
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

    describe("containing objects", function() { with(this) {
      before(function() { with(this) {
        this.set = new Set()
      }})

      it("rejects equal objects", function() { with(this) {
        set.add( new sets.OrderedSet )
        set.add( new sets.Set )
        assertSetEqual( [new sets.Set], set )
      }})

      it("accepts non-equal objects", function() { with(this) {
        set.add( new sets.SortedSet )
        set.add( new sets.Set([12]) )
        assertEqual( 2, set.entries().length )
        assert( set.contains(new sets.OrderedSet) )
        assert( set.contains(new sets.Set([12])) )
      }})

      describe("#remove", function() { with(this) {
        before(function() { with(this) {
          set.add( new sets.OrderedSet )
          set.add( new sets.Set([12]) )
        }})

        it("removes objects that equal the argument", function() { with(this) {
          set.remove( new sets.Set )
          assertEqual( 1, set.size )
          assert( set.contains(new sets.Set([12])) )
        }})

        it("does not remove objects that do not equal the argument", function() { with(this) {
          set.remove( new sets.Set([6]) )
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
  }})

  describe("Set", function() { with(this) {
    before(function() { this.Set = sets.Set })
    behavesLike("set")
    behavesLike("unsorted set")
  }})

  describe("OrderedSet", function() { with(this) {
    before(function() { this.Set = sets.OrderedSet })
    behavesLike("set")
    behavesLike("unsorted set")

    before(function() { with(this) {
      this.Color = new JS.Class({
          initialize: function(code) {
              this.code = code;
          },
          equals: function(color) {
              return color.code === this.code;
          },
          hash: function() {
            return this.code.toLowerCase();
          }
      });
    }})

    it("keeps its elements in insertion order", function() { with(this) {
      var colors = map($w('red blue RED'), function(c) { return new Color(c) })
      var set = new sets.OrderedSet(colors)
      assertEqual( $w('red blue RED'), map(set.entries(), 'code') )
    }})
  }})

  describe("SortedSet", function() { with(this) {
    before(function() { this.Set = sets.SortedSet })
    behavesLike("set")
  }})

  describe("#equals", function() { with(this) {
    before(function() { with(this) {
      this.set        = new sets.Set(['j','s','c'])
      this.orderedset = new sets.OrderedSet(['j','s','c'])
      this.sorted     = new sets.SortedSet(['j','s','c'])
      this.bigger     = new sets.Set(['j','s','c','g'])
      this.smaller    = new sets.Set(['j','s'])
      this.diff       = new sets.SortedSet(['j','b','f'])
    }})

    it("returns true for sets with the same members", function() { with(this) {
      assertEqual( set,        orderedset )
      assertEqual( set,        sorted  )
      assertEqual( orderedset, sorted  )
    }})

    it("returns false for sets with different members", function() { with(this) {
      assertNotEqual( set,        bigger  )
      assertNotEqual( orderedset, smaller )
      assertNotEqual( sorted,     diff    )
    }})
  }})

  describe("sorted sets", function() { with(this) {
    before(function() { with(this) {
      this.a = new sets.SortedSet([8,3,6,1])
      this.b = new sets.Set([2,9,7,4])

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
            uniques = new sets.Set(list).entries()

        assertNotEqual( [], uniques )

        var sorted  = new sets.SortedSet(list).entries()
        uniques.sort(function(a,b) { return a - b })
        assertEqual( uniques, sorted )
      })
    }})

    describe("containing homogenous values", function() { with(this) {
      before(function() { with(this) {
        this.set = new sets.SortedSet()
        $R(1,20).forEach(function(position) { set.add(new TodoItem(position%4)) })
      }})

      it("keeps the members sorted", function() { with(this) {
        assertEqual( [0,0,0,0,0,1,1,1,1,1,2,2,2,2,2,3,3,3,3,3], set.map('position') )
      }})
    }})

    describe("containing objects", function() { with(this) {
      it("sorts the objects", function() { with(this) {
        var set = new sets.SortedSet()
        forEach([4,3,5,1,2], function(position) {
          set.add(new TodoItem(position))
        })
        assertEqual( [1,2,3,4,5], set.map('position') )
      }})
    }})
  }})
}})

})

