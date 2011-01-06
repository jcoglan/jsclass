JS.Test.Mocking.extend({
  Anything: new JS.Class({
    equals: function() { return true },
    toString: function() { return 'anything' }
  }),
  
  AnyArgs: new JS.Class({
    equals: function() { return JS.Enumerable.ALL_EQUAL },
    toString: function() { return '*arguments' }
  }),
  
  ArrayIncluding: new JS.Class({
    initialize: function(elements) {
      this._elements = elements;
    },
    
    equals: function(array) {
      if (!JS.isType(array, Array)) return false;
      var i = this._elements.length;
      while (i--) {
        if (JS.indexOf(array, this._elements[i]) === -1)
          return false;
      }
      return true;
    },
    
    toString: function() {
      var name = JS.Test.Unit.AssertionMessage.convert(this._elements);
      return 'arrayIncluding' + name;
    }
  }),
  
  ObjectIncluding: new JS.Class({
    initialize: function(elements) {
      this._elements = elements;
    },
    
    equals: function(object) {
      if (!JS.isType(object, Object)) return false;
      for (var key in this._elements) {
        if (!JS.Enumerable.areEqual(this._elements[key], object[key]))
          return false;
      }
      return true;
    },
    
    toString: function() {
      var name = JS.Test.Unit.AssertionMessage.convert(this._elemets);
      return 'objectIncluding' + name;
    }
  }),
  
  InstanceOf: new JS.Class({
    initialize: function(type) {
      this._type = type;
    },
    
    equals: function(object) {
      return JS.isType(object, this._type);
    },
    
    toString: function() {
      var name = JS.Test.Unit.AssertionMessage.convert(this._type),
          an   = /^[aeiou]/i.test(name) ? 'an' : 'a';
      return an + '(' + name + ')';
    }
  }),
  
  Matcher: new JS.Class({
    initialize: function(type) {
      this._type = type;
    },
    
    equals: function(object) {
      return JS.match(this._type, object);
    },
    
    toString: function() {
      var name = JS.Test.Unit.AssertionMessage.convert(this._type);
      return 'matching(' + name + ')';
    }
  })
});

