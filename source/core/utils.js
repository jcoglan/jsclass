<%= license %>

JS = {
  extend: function(object, methods) {
    methods = methods || {};
    for (var prop in methods) {
      if (object[prop] === methods[prop]) continue;
      object[prop] = methods[prop];
    }
    return object;
  },
  
  makeFunction: function() {
    return function() {
      return this.initialize
          ? (this.initialize.apply(this, arguments) || this)
          : this;
    };
  },
  
  makeBridge: function(klass) {
    var bridge = function() {};
    bridge.prototype = klass.prototype;
    return new bridge;
  },
  
  delegate: function(property, method) {
    return function() {
      return this[property][method].apply(this[property], arguments);
    };
  },
  
  bind: function() {
    var args = JS.array(arguments), method = args.shift(), object = args.shift() || null;
    return function() {
      return method.apply(object, args.concat(JS.array(arguments)));
    };
  },
  
  callsSuper: function(func) {
    return func.SUPER === undefined
        ? func.SUPER = /\bcallSuper\b/.test(func.toString())
        : func.SUPER;
  },
  
  mask: function(func) {
    var string = func.toString().replace(/callSuper/g, 'super');
    func.toString = function() { return string };
    return func;
  },
  
  array: function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length, results = [];
    while (length--) results[length] = iterable[length];
    return results;
  },
  
  indexOf: function(haystack, needle) {
    for (var i = 0, n = haystack.length; i < n; i++) {
      if (haystack[i] === needle) return i;
    }
    return -1;
  },
  
  isFn: function(object) {
    return object instanceof Function;
  },
  
  ignore: function(key, object) {
    return /^(include|extend)$/.test(key) && typeof object === 'object';
  }
};

