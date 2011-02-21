JS.ENV.LinkedListSpec = JS.Test.describe(JS.LinkedList, function() { with(this) {
  describe(JS.LinkedList.Doubly.Circular, function() { with(this) {
    before(function() { with(this) {
      this.list = new JS.LinkedList.Doubly.Circular()
      this.foo = {}
      this.bar = {}
      this.qux = {}
    }})
    
    define("assertList", function(expected, list) {
      this.__wrapAssertion__(function() {
        this.assertEqual( expected, list.entries() )
        var n = expected.length
        this.assertEqual( expected[0], list.first )
        this.assertEqual( expected[n-1], list.last )
        
        var item = list.last
        while (n--) {
          var prev = n-1, next = n+1
          if (prev < 0) prev = expected.length-1
          if (next === expected.length) next = 0
          this.assertSame( expected[prev], item.prev )
          this.assertSame( expected[next], item.next )
          item = item.prev
        }
      })
    })
    
    describe("an empty list", function() { with(this) {
      it("has no length", function() { with(this) {
        assertSame( 0, list.length )
      }})
      
      it("has no start or end", function() { with(this) {
        assertNull( list.first )
        assertNull( list.last )
      }})
      
      it("is Enumerable", function() { with(this) {
        assertKindOf( JS.Enumerable, list )
      }})
      
      describe("#push", function() { with(this) {
        before(function() { this.list.push(this.foo) })
        
        it("adds the item to the list", function() { with(this) {
          assertSame( foo, list.first )
          assertSame( foo, list.last )
          assertList( [foo], list )
        }})
        
        it("adds pointers to the new object", function() { with(this) {
          assertSame( foo, foo.prev )
          assertSame( foo, foo.next )
        }})
      }})
      
      describe("#unshift", function() { with(this) {
        before(function() { this.list.unshift(this.bar) })
        
        it("adds the item to the list", function() { with(this) {
          assertSame( bar, list.first )
          assertSame( bar, list.last )
          assertList( [bar], list )
        }})
        
        it("adds pointers to the new object", function() { with(this) {
          assertSame( bar, bar.prev )
          assertSame( bar, bar.next )
        }})
      }})
      
      describe("#pop", function() { with(this) {
        it("returns undefined", function() { with(this) {
          assertSame( undefined, list.pop() )
        }})
      }})
      
      describe("#shift", function() { with(this) {
        it("returns undefined", function() { with(this) {
          assertSame( undefined, list.shift() )
        }})
      }})
    }})
    
    describe("with members", function() { with(this) {
      before(function() { with(this) {
        list.push(foo)
        list.push(bar)
      }})
      
      describe("#at", function() { with(this) {
        it("returns the the item in nth position in the list", function() { with(this) {
          assertSame( foo, list.at(0) )
          assertSame( bar, list.at(1) )
        }})
        
        it("returns undefined if the index is out of bounds", function() { with(this) {
          assertSame( undefined, list.at(2) )
        }})
      }})
      
      describe("#push", function() { with(this) {
        before(function() { this.list.push(this.qux) })
        
        it("appends the item to the list", function() { with(this) {
          assertSame( qux, list.last )
          assertList( [foo, bar, qux], list )
        }})
        
        it("adds pointers to the new object", function() { with(this) {
          assertSame( bar, qux.prev )
          assertSame( foo, qux.next )
        }})
      }})
      
      describe("#unshift", function() { with(this) {
        before(function() { this.list.unshift(this.qux) })
        
        it("prepends the item to the list", function() { with(this) {
          assertSame( qux, list.first )
          assertList( [qux, foo, bar], list )
        }})
        
        it("adds pointers to the new object", function() { with(this) {
          assertSame( bar, qux.prev )
          assertSame( foo, qux.next )
        }})
      }})
      
      describe("#pop", function() { with(this) {
        it("removes the last item from the list", function() { with(this) {
          list.pop()
          assertList( [foo], list )
        }})
        
        it("returns the last item", function() { with(this) {
          assertSame( bar, list.pop() )
        }})
      }})
      
      describe("#shift", function() { with(this) {
        it("removes the first item from the list", function() { with(this) {
          list.shift()
          assertList( [bar], list )
        }})
        
        it("returns the first item", function() { with(this) {
          assertSame( foo, list.shift() )
        }})
      }})
      
      describe("#insertBefore", function() { with(this) {
        it("adds an item before the first item", function() { with(this) {
          list.insertBefore(foo, qux)
          assertList( [qux, foo, bar], list )
        }})
        
        it("adds an item before any item", function() { with(this) {
          list.insertBefore(bar, qux)
          assertList( [foo, qux, bar], list )
        }})
        
        it("leaves the list unchanged if the target is not in the list", function() { with(this) {
          list.insertBefore(list, qux)
          assertList( [foo, bar], list )
        }})
      }})
      
      describe("#insertAfter", function() { with(this) {
        it("adds an item after the last item", function() { with(this) {
          list.insertAfter(bar, qux)
          assertList( [foo, bar, qux], list )
        }})
        
        it("adds an item after any item", function() { with(this) {
          list.insertAfter(foo, qux)
          assertList( [foo, qux, bar], list )
        }})
        
        it("leaves the list unchanged if the target is not in the list", function() { with(this) {
          list.insertAfter(list, qux)
          assertList( [foo, bar], list )
        }})
      }})
      
      describe("#insertAt", function() { with(this) {
        it("is a shorthand for insertBefore(list.at())", function() { with(this) {
          expect(list, "at").given(1).returning(bar)
          expect(list, "insertBefore").given(bar, qux)
          list.insertAt(1, qux)
        }})
      }})
      
      describe("#remove", function() { with(this) {
        it("removes the given item from the list", function() { with(this) {
          list.remove(bar)
          assertList( [foo], list )
        }})
        
        it("removes list pointers from the removed item", function() { with(this) {
          list.remove(bar)
          assertNull( bar.prev )
          assertNull( bar.next )
          assertNull( bar.list )
        }})
      }})
    }})
  }})
}})

