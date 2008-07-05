(function() {
  
  var Type = JS.Class({
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
      Collection: JS.Class({
        initialize: function(array) {
          var list = [], i, n = array.length;
          for (i = 0; i < n; i++)
            list.push(new Type(array[i]));
          this.list = list;
        },
        test: function(values) {
          for (var i = 0, n = this.list.length; i < n; i++) {
            if (!this.list[i].test(values[i])) return false;
          }
          return true;
        }
      })
    }
  });
  
  JS.extend(Function.prototype, {
    expects: function() {
      var method = this, types = new Type.Collection(arguments);
      return function() {
        if (!types.test(arguments))
          throw new Error('Invalid argument types');
        return method.apply(this, arguments);
      };
    },
    
    returns: function(type) {
      var method = this, types = new Type.Collection([type]);
      return function() {
        var result = method.apply(this, arguments);
        if (!types.test([result]))
          throw new Error('Invalid return type');
        return result;
      };
    }
  });
})();
