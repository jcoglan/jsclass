(function() {
  
  var TypeMatcher = JS.Class({
    initialize: function(type) {
      this.type = type;
      switch (true) {
        case type instanceof Function :
          this.test = this.testClass;
          break;
        case type instanceof JS.Interface :
          this.test = this.testInterface;
          break;
        case typeof type == 'string' || type instanceof String :
          this.test = this.testType;
          break;
      }
    },
    testClass: function(data) {
      return data ? (data.isA ? data.isA(this.type) : (data instanceof this.type)) : false;
    },
    testInterface: function(data) {
      return this.type.test(data);
    },
    testType: function(data) {
      return (typeof data == this.type);
    },
    extend: {
      arrayFrom: function(array) {
        var list = [], i, n = array.length;
        for (i = 0; i < n; i++)
          list.push(new this(array[i]));
        return list;
      }
    }
  });
  
  var signaturesMatch = function(types, values) {
    for (var i = 0, n = types.length, a, b; i < n; i++) {
      if (!types[i].test(values[i])) return false;
    }
    return true;
  };

  Function.prototype.expects = function() {
    var method = this, types = TypeMatcher.arrayFrom(arguments);
    return function() {
      if (!signaturesMatch(types, arguments))
        throw new Error('Invalid argument types');
      return method.apply(this, arguments);
    };
  };

  Function.prototype.returns = function(type) {
    var method = this, types = [new TypeMatcher(type)];
    return function() {
      var result = method.apply(this, arguments);
      if (!signaturesMatch(types, [result]))
        throw new Error('Invalid return type');
      return result;
    };
  };
})();
