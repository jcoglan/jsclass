(function() {

var E      = (typeof exports === "object")
    hashes = E ? JS.Package.loadFile(JSCLASS_PATH + "/hash") : JS

JS.ENV.HashSpec = JS.Test.describe(hashes.Hash, function() { with(this) {
  include(JS.Test.Helpers)

  before(function() { with(this) {
    this.Car = new JS.Class({
        initialize: function(brand) {
            this.brand = brand;
        },
        equals: function(car) {
            return car.brand.toLowerCase() === this.brand.toLowerCase();
        },
        hash: function() {
            return this.brand.toLowerCase();
        }
    });

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

  sharedBehavior("hashtable", function() { with(this) {
    describe("with primitive keys", function() { with(this) {
      before(function() { with(this) {
        this.hash = new Hash([ 3,6, 1,8, 8,5, 3,9, 0,4 ])
      }})

      it("has a size matching the number of unique keys", function() { with(this) {
        assertEqual( 4, hash.size )
      }})

      it("has a #get method that looks up values by key", function() { with(this) {
        assertEqual( 9, hash.get(3) )
      }})

      it("has pairs with primitive values", function() { with(this) {
        assertEqual( [0,1,3,8], hash.map('key').sort() )
      }})

      it("has a #clear method that removes all the pairs", function() { with(this) {
        hash.clear()
        assert( hash.isEmpty() )
        assertEqual( [], hash.entries() )
      }})

      describe("#merge", function() { with(this) {
        before(function() { with(this) {
          this.second = new Hash([ 1,3, 8,9, 3,4, 0,6, 5,3 ])
        }})

        it("keeps value from the second hash if no block is passed", function() { with(this) {
          assertEqual( new Hash([ 1,3, 8,9, 3,4, 0,6, 5,3 ]), hash.merge(second) )
        }})

        it("lets the block decide which value to keep", function() { with(this) {
          var result = hash.merge(second, function(key, a, b) { return Math.max(a,b) })
          assertEqual( new Hash([ 1,8, 8,9, 3,9, 0,6, 5,3 ]), result )
        }})
      }})

      describe("#isEmpty", function() { with(this) {
        it("returns true for empty hashes", function() { with(this) {
          assert( new Hash().isEmpty() )
        }})

        it("returns false for non-empty hashes", function() { with(this) {
          assert( !(new Hash([3,4]).isEmpty()) )
        }})
      }})

      describe("#replace", function() { with(this) {
        it("replaces the contents of the hash", function() { with(this) {
          hash.replace(new Hash([4,5, 9,3, 2,7]))
          assertEqual( new Hash([4,5, 9,3, 2,7]), hash )
        }})
      }})

      describe("#shift", function() { with(this) {
        it("returns a pair", function() { with(this) {
          assertKindOf( Hash.Pair, hash.shift() )
        }})

        it("returns null for empty hashes", function() { with(this) {
          assertNull( new Hash().shift() )
        }})

        it("removes a pair from the hash", function() { with(this) {
          var removed = hash.shift()
          assert( !hash.hasKey(removed.key) )
        }})
      }})

      describe("#sort", function() { with(this) {
        it("returns an array of pairs", function() { with(this) {
          assertKindOf( Array, hash.sort() )
          assertKindOf( Hash.Pair, hash.sort()[0] )
        }})

        it("returns the pairs sorted by key", function() { with(this) {
          assertEqual( [0,1,3,8], map(hash.sort(), 'key') )
        }})
      }})
    }})

    describe("with object keys", function() { with(this) {
      before(function() { with(this) {
        this.hash = new Hash()
        hash.store(new Car('ferari'), new Color('red'))
        hash.store(new Car('ford'),   new Color('blue'))
        hash.store(new Car('jaguar'), new Color('green'))
        hash.store(new Car('lotus'),  new Color('yellow'))
      }})

      describe("#assoc", function() { with(this) {
        it("returns the pair whose key matches the argument", function() { with(this) {
          var pair = hash.assoc(new Car('jaguar'))
          assertEqual( 'jaguar', pair.key.brand )
          assertEqual( 'green',  pair.value.code )
        }})

        it("returns null if no pair matches", function() { with(this) {
          assertNull( hash.assoc(new Car('nothing')) )
        }})
      }})

      describe("#rassoc", function() { with(this) {
        it("returns the pair whose value matches the argument", function() { with(this) {
          var pair = hash.rassoc(new Color('blue'))
          assertEqual( 'ford', pair.key.brand )
          assertEqual( 'blue', pair.value.code )
        }})

        it("returns null if no pair matches", function() { with(this) {
          assertNull( hash.rassoc(new Color('black')) )
        }})
      }})

      describe("#get", function() { with(this) {
        it("returns the value corresponding to the given key", function() { with(this) {
          assertEqual( 'green', hash.get(new Car('jaguar')).code )
        }})

        it("uses the keys' #equals() method for comparison", function() { with(this) {
          assertEqual( 'red', hash.get(new Car('FeRaRi')).code )
        }})

        it("returns null if no such key exists", function() { with(this) {
          assertNull( hash.get(new Car('none')) )
        }})
      }})

      describe("#fetch", function() { with(this) {
        it("returns the value corresponding to the given key", function() { with(this) {
          assertEqual( 'green', hash.fetch(new Car('jaguar')).code )
        }})

        it("uses the keys' #equals() method for comparison", function() { with(this) {
          assertEqual( 'red', hash.fetch(new Car('FeRaRi')).code )
        }})

        it("throws an error if no such key exists", function() { with(this) {
          assertThrows( Error, function() { hash.fetch(new Car('none')) })
        }})

        it("returns the default value if one is given", function() { with(this) {
          assertEqual( 'foo', hash.fetch('something', 'foo') )
        }})

        it("calls the block with the key if the key is not found", function() { with(this) {
          assertEqual( 'Go fish, something', hash.fetch('something', function(k) { return 'Go fish, ' + k }) )
        }})
      }})

      describe("#valuesAt", function() { with(this) {
        before(function() { with(this) {
          this.values = hash.valuesAt(new Car('ford'), new Car('ferari'))
        }})

        it("returns an array of values", function() { with(this) {
          assertKindOf( Array, values )
          assertKindOf( Color, values[0] )
        }})

        it("returns the values for the given keys", function() { with(this) {
          assertEqual( $w('blue red'), map(values, 'code').sort() )
        }})
      }})

      describe("#put", function() { with(this) {
        before(function() { with(this) {
          assertNull( hash.get(new Car('audi')) )
        }})

        it("adds a pair to the hash", function() { with(this) {
          hash.put(new Car('audi'), new Color('silver'))
          assertNotNull( hash.get(new Car('audi')) )
        }})
      }})

      describe("#equals", function() { with(this) {
        it("returns true if the hashes are equal", function() { with(this) {
          assertEqual( new Hash([
            new Car('ferari'),  new Color('red'),
            new Car('jaguar'),  new Color('green'),
            new Car('ford'),    new Color('blue'),
            new Car('lotus'),   new Color('yellow')
            ]), hash )
        }})

        it("returns false if the first has an extra pair", function() { with(this) {
          assertNotEqual( new Hash([
            new Car('ferari'),  new Color('red'),
            new Car('jaguar'),  new Color('green'),
            new Car('ford'),    new Color('blue'),
            new Car('lotus'),   new Color('yellow'),
            new Car('vw'),      new Color('black')
            ]), hash )
        }})

        it("returns false if the second has an extra pair", function() { with(this) {
          assertNotEqual( new Hash([
            new Car('ferari'),  new Color('red'),
            new Car('jaguar'),  new Color('green'),
            new Car('ford'),    new Color('blue')
            ]), hash )
        }})

        it("returns false if one has a different value", function() { with(this) {
          assertNotEqual( new Hash([
            new Car('ferari'),  new Color('red'),
            new Car('jaguar'),  new Color('green'),
            new Car('ford'),    new Color('brown'),
            new Car('lotus'),   new Color('yellow')
            ]), hash )
        }})

        it("returns false if one has a different key", function() { with(this) {
          assertNotEqual( new Hash([
            new Car('ferari'),  new Color('red'),
            new Car('jaguar'),  new Color('green'),
            new Car('toyota'),  new Color('blue'),
            new Car('lotus'),   new Color('yellow')
            ]), hash )
        }})
      }})

      describe("#key", function() { with(this) {
        it("returns the first key matching the given value", function() { with(this) {
          assertEqual( 'lotus', hash.key(new Color('yellow')).brand )
        }})

        it("returns null if the value does not exist", function() { with(this) {
          assertNull( hash.key(new Color('pink')) )
        }})
      }})

      describe("#invert", function() { with(this) {
        it("swaps the keys with the values", function() { with(this) {
          assertEqual( new Hash([
            new Color('red'),     new Car('ferari'),
            new Color('green'),   new Car('jaguar'),
            new Color('blue'),    new Car('ford'),
            new Color('yellow'),  new Car('lotus')
            ]), hash.invert() )
        }})
      }})

      describe("#keys", function() { with(this) {
        it("returns an array", function() { with(this) {
          assertKindOf( Array, hash.keys() )
        }})

        it("returns the hash keys", function() { with(this) {
          var keys = hash.keys()
          assertKindOf( Car, keys[0] )
          assertEqual( $w('ferari ford jaguar lotus'), map(keys, 'brand').sort() )
        }})
      }})

      describe("#values", function() { with(this) {
        it("returns an array", function() { with(this) {
          assertKindOf( Array, hash.values() )
        }})

        it("returns the hash values", function() { with(this) {
          var values = hash.values()
          assertKindOf( Color, values[0] )
          assertEqual( $w('blue green red yellow'), map(values, 'code').sort() )
        }})
      }})

      describe("#hasKey", function() { with(this) {
        it("returns true if the key exists", function() { with(this) {
          assert( hash.hasKey(new Car('ford')) )
        }})

        it("returns false if the key does not exist", function() { with(this) {
          assert( !hash.hasKey(new Car('nothing')) )
        }})
      }})

      describe("#hasValue", function() { with(this) {
        it("returns true if the value exists", function() { with(this) {
          assert( hash.hasValue(new Color('red')) )
        }})

        it("returns false if the value does not exist", function() { with(this) {
          assert( !hash.hasValue(new Color('beige')) )
        }})
      }})

      describe("#remove", function() { with(this) {
        before(function() { with(this) {
          assert( hash.hasKey(new Car('ferari')) )
        }})

        it("removes the given key from the hash", function() { with(this) {
          hash.remove(new Car('ferari'))
          assert( !hash.hasKey(new Car('ferari')) )
        }})

        it("returs the value for the key", function() { with(this) {
          assertEqual( 'red', hash.remove(new Car('ferari')).code )
        }})

        it("has no effect if the key does not exist", function() { with(this) {
          assertNull( hash.remove(new Car('volvo')) )
          assert( hash.hasKey(new Car('ferari')) )
        }})

        it("does not corrupt the rest of the hash", function() { with(this) {
          hash.remove(new Car('ferari'))
          assertEqual( $w('ford jaguar lotus'), map(hash.keys(), 'brand') )
        }})
      }})

      describe("#removeIf", function() { with(this) {
        before(function() { with(this) {
          hash.removeIf(function(pair) {
            return pair.key.brand === 'lotus' || pair.value.code === 'green'
          })
        }})

        it("removes pairs for which the block returns true", function() { with(this) {
          assertEqual( new Hash([
            new Car('ferari'),  new Color('red'),
            new Car('ford'),    new Color('blue')
            ]), hash )
        }})
      }})

      describe("#compareByIdentity", function() { with(this) {
        before(function() { with(this) {
          this.key  = hash.keys()[0]
          this.copy = new Car(key.brand)
          assert( hash.hasKey(key) )
          assert( hash.hasKey(copy) )
          hash.compareByIdentity()
        }})

        it("makes the hash ignore objects' #equals methods", function() { with(this) {
          assert( hash.hasKey(key) )
          assert( !hash.hasKey(copy) )
        }})
      }})

      describe("#rehash", function() { with(this) {
        before(function() { with(this) {
          this.key  = hash.keys()[0]
          key.brand = 'toyota'
          this.copy = new Car(key.brand)
        }})

        it("reindexes the hash", function() { with(this) {
          assert( !hash.hasKey(copy) )
          hash.rehash()
          assert( hash.hasKey(copy) )
        }})
      }})

      describe("#select", function() { with(this) {
        before(function() { with(this) {
          this.filtered = hash.select(function(pair) {
            return pair.key.brand === 'ford' || pair.value.code === 'yellow';
          })
        }})

        it("returns an array of pairs", function() { with(this) {
          assertKindOf( Array, filtered )
          assertKindOf( Hash.Pair, filtered[0] )
        }})

        it("selects pairs using the block", function() { with(this) {
          assertEqual( $w('ford lotus'), map(map(filtered, 'key'), 'brand').sort() )
        }})
      }})

      describe("#getDefault", function() { with(this) {
        it("returns null for hashes with no default value", function() { with(this) {
          assertNull( new Hash().getDefault() )
        }})

        it("returns a constant value if the hash has a default value", function() { with(this) {
          assertEqual( 5, new Hash(5).getDefault() )
          assertEqual( 5, new Hash(5).getDefault(2) )
        }})

        it("returns a value based on the key if the hash has a default function", function() { with(this) {
          var hash = new Hash(function(h,key) { return key + 2 })
          assertEqual( 4, hash.getDefault(2) )
          assertEqual( 7, hash.getDefault(5) )
        }})
      }})

      describe("with a default value", function() { with(this) {
        before(function() { with(this) {
          hash.setDefault(new Color('orange'))
        }})

        describe("#get", function() { with(this) {
          it("returns the value for the given key", function() { with(this) {
            assertEqual( 'green', hash.get(new Car('jaguar')).code )
          }})

          it("returns the default value if the key is missing", function() { with(this) {
            assertEqual( 'orange', hash.get(new Car('honda')).code )
          }})
        }})

        describe("#remove", function() { with(this) {
          it("returns the value for the given key", function() { with(this) {
            assertEqual( 'green', hash.remove(new Car('jaguar')).code )
          }})

          it("returns the default value if the key is missing", function() { with(this) {
            assertEqual( 'orange', hash.remove(new Car('honda')).code )
          }})
        }})
      }})

      describe("with a default function", function() { with(this) {
        before(function() { with(this) {
          hash.setDefault(function(h, car) { return 'red ' + car.brand })
        }})

        describe("#get", function() { with(this) {
          it("returns the value for the given key", function() { with(this) {
            assertEqual( 'green', hash.get(new Car('jaguar')).code )
          }})

          it("returns the default value if the key is missing", function() { with(this) {
            assertEqual( 'red honda', hash.get(new Car('honda')) )
          }})
        }})

        describe("#remove", function() { with(this) {
          it("returns the value for the given key", function() { with(this) {
            assertEqual( 'green', hash.remove(new Car('jaguar')).code )
          }})

          it("returns the default value if the key is missing", function() { with(this) {
            assertEqual( 'red honda', hash.remove(new Car('honda')) )
          }})
        }})
      }})
    }})

    describe("with plain-old-object keys", function() { with(this) {
      before(function() { with(this) {
        this.hash = new Hash()
        this.A = {foo: 1}
        this.B = {foo: 2}
        this.C = {foo: 1}

        hash.store(A,'a')
        hash.store(B,'b')
        hash.store(C,'c')
      }})

      it("rejects duplicate key objects", function() { with(this) {
        assertEqual( 2, hash.size )
        assertEqual( [{foo: 1}, {foo: 2}], hash.keys().sort(function(a,b) { return a.foo - b.foo }) )
        assertEqual( ['b','c'], hash.values().sort() )
      }})

      it("recognizes equal objects as keys", function() { with(this) {
        assertEqual( hash.get(A), hash.get(C) )
      }})

      describe("#compareByIdentity", function() { with(this) {
        before(function() { with(this) {
          hash.compareByIdentity()
          hash.store(A,'a')
          hash.store(B,'b')
          hash.store(C,'c')
        }})

        it("makes the hash treat unidentical objects as unequal", function() { with(this) {
          assertEqual( 3, hash.size )
          assertEqual( [{foo: 1}, {foo: 1}, {foo: 2}], hash.keys().sort(function(a,b) { return a.foo - b.foo }) )
          assertEqual( ['a','b','c'], hash.values().sort() )
        }})
      }})
    }})
  }})

  describe("Hash", function() { with(this) {
    before(function() { this.Hash = hashes.Hash })
    behavesLike("hashtable")
  }})

  describe("OrderedHash", function() { with(this) {
    before(function() { this.Hash = hashes.OrderedHash })
    behavesLike("hashtable")

    describe("ordering", function() { with(this) {
      before(function() { with(this) {
        this.hash = new hashes.OrderedHash([
          new Color('red'),  3,
          new Color('blue'), 2,
          new Color('RED'),  1
        ])
      }})

      it("keeps its keys in insertion order", function() { with(this) {
        assertEqual( $w('red blue RED'), map(hash.keys(), 'code') )
      }})

      it("keeps its values in insertion order", function() { with(this) {
        assertEqual( [3,2,1], hash.values() )
      }})
    }})
  }})
}})

})()

