(function() {
  var interfaces = !!(typeof JS != 'undefined' && JS.Interface);

  var signaturesMatch = function(expected, actual) {
    var n = expected.length, valid, a, b;
    for (var i = 0; i < n; i++) {
      a = actual[i]; b = expected[i]; valid = true;
      switch (true) {
        case b instanceof Function :
          try { valid = a.isA(b); }
          catch (e) { valid = (a instanceof b); }
          break;
        case interfaces && b instanceof JS.Interface :
          valid = b.test(a);
          break;
        case typeof b == 'string' || b instanceof String :
          valid = (typeof a == b);
          break;
      }
      if (!valid) return false;
    }
    return true;
  };

  Function.prototype.expects = function() {
    var method = this, args = arguments;
    return function() {
      if (!signaturesMatch(args, arguments))
        throw new Error('Invalid argument types');
      return method.apply(this, arguments);
    };
  };

  Function.prototype.returns = function(type) {
    var method = this;
    return function() {
      var result = method.apply(this, arguments);
      if (!signaturesMatch([type], [result]))
        throw new Error('Invalid return type');
      return result;
    };
  };
})();
