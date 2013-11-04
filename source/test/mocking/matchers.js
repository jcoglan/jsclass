Test.Mocking.extend({
  Anything: new JS.Class({
    equals: function() { return true },
    toString: function() { return 'anything()' }
  }),

  AnyArgs: new JS.Class({
    equals: function() { return Enumerable.ALL_EQUAL },
    toString: function() { return 'anyArgs()' }
  }),

  ArrayIncluding: new JS.Class({
    initialize: function(elements) {
      this._elements = Array.prototype.slice.call(elements);
    },

    equals: function(array) {
      if (!JS.isType(array, Array)) return false;
      var i = this._elements.length, j;
      loop: while (i--) {
        j = array.length;
        while (j--) {
          if (Enumerable.areEqual(this._elements[i], array[j]))
            continue loop;
        }
        return false;
      }
      return true;
    },

    toString: function() {
      var name = Console.convert(this._elements);
      return 'arrayIncluding(' + name + ')';
    }
  }),

  ObjectIncluding: new JS.Class({
    initialize: function(elements) {
      this._elements = elements;
    },

    equals: function(object) {
      if (!JS.isType(object, Object)) return false;
      for (var key in this._elements) {
        if (!Enumerable.areEqual(this._elements[key], object[key]))
          return false;
      }
      return true;
    },

    toString: function() {
      var name = Console.convert(this._elements);
      return 'objectIncluding(' + name + ')';
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
      var name = Console.convert(this._type);
      return 'instanceOf(' + name + ')';
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
      var name = Console.convert(this._type);
      return 'match(' + name + ')';
    }
  })
});

