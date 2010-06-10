RangeSpec = JS.Test.describe(JS.Range, function() {
  include(JS.Test.Helpers)
  
  before(function() {
    this.R = function(start,end,f) { return new JS.Range(start,end,f) }
    this.succ = JS.Range.method('succ')
  })
  
  describe("succ()", function() {
    it("returns the next number for integers", function() {
      assertSame( 5,      succ(4)     )
      assertSame( 10,     succ(9)     )
      assertSame( 100,    succ(99)    )
      assertSame( 101,    succ(100)   )
    })
    
    it("returns the next letter for characters", function() {
      assertSame( 'f',    succ('e')   )
      assertSame( 'R',    succ('Q')   )
    })
    
    it("handles multicharacter strings", function() {
      assertSame( '10',   succ('9')   )
      assertSame( 'bla',  succ('bkz') )
      assertSame( 'AA',   succ('Z')   )    
    })
  })
  
  it("includes the last element by default", function() {
    assertEqual( [1,2,3,4], R(1,4).entries() )
  })
  
  it("excludes the last element if flagged as true", function() {
    assertEqual( [1,2,3], R(1,4,true).entries() )
  })
  
  it("includes the last element if flagged as false", function() {
    assertEqual( [1,2,3,4], R(1,4,false).entries() )
  })
  
  it("creates ranges of characters", function() {
    assertEqual( $w('a b c d e f g h i j k l m'), R('a','m').entries() )
    assertEqual( $w('2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21'), R('2','21').entries() )
  })
  
  it("creates an empty range if the start > the end", function() {
    assertEqual( [], R('b','ac').entries() )
  })
  
  it("only includes the start if start < end but we cannot reach end through #succ()", function() {
    assertEqual( ['ba'], R('ba','c').entries() )
  })
  
  it("has no elements if the start and end are the same and the end is excluded", function() {
    assertEqual( [], R('a','a',true).entries() )
  })
  
  describe("with objects", function() {
    before(function() {
      this.Wrapper = new JS.Class({
          initialize: function(value) {
              this.value = value;
          },
          
          compareTo: function(object) {
              return this.value - object.value;
          },
          
          succ: function() {
              return new this.klass(JS.Range.succ(5 + this.value));
          }
      })
    })
    
    it("uses the object's #succ and #compareTo methods", function() {
      var range = R(new Wrapper(1), new Wrapper(25))
      assertEqual( [1,7,13,19,25], range.map('value') )
      
      var range = R(new Wrapper(1), new Wrapper(20))
      assertEqual( [1,7,13,19], range.map('value') )
      
      var range = R(new Wrapper(1), new Wrapper(25), true)
      assertEqual( [1,7,13,19], range.map('value') )
    })
  })
  
  describe("#match", function() {
    it("returns true if the range contains the value", function() {
      forEach([1,3,4], function(x) { assert( R(1,4).match(x) ) })
      forEach($w('a k m'), function(x) { assert( R('a','m').match(x) ) })
    })
    
    it("returns false if the range does not contain the value", function() {
      forEach([0,4,6], function(x) { assert( !R(1,4,true).match(x) ) })
      forEach(['m','x'], function(x) { assert( !R('a','m',true).match(x) ) })
    })
  })
  
  describe("#step", function() {
    it("changes the iteration step of the range", function() {
      assertEqual( [1,4,7], R(1,9).step(3).entries() )
    })
  })
  
  describe("#equals", function() {
    it("returns true if the ranges are equal", function() {
      assertEqual( R(1,5), R(1,5) )
      assertEqual( R(1,5), R(1,5,false) )
      assertEqual( R(1,5,true), R(1,5,true) )
    })
    
    it("returns false if the start points differ", function() {
      assertNotEqual( R(2,5), R(1,5) )
    })
    
    it("returns false if the end points differ", function() {
      assertNotEqual( R(1,5), R(1,6) )
    })
    
    it("returns false if the exclude-end flags differ", function() {
      assertNotEqual( R(1,5,true), R(1,5) )
    })
  })
  
  describe("#hash", function() {
    it("contains the start and end points", function() {
      assertEqual( "4..7", R(4,7).hash() )
    })
    
    it("contains an extra dot if the end is excluded", function() {
      assertEqual( "4...7", R(4,7,true).hash() )
    })
  })
})

