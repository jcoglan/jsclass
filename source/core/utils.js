<%= license %>

/**
 * @overview
 * This file contains a set of 'global' functions used throughout JS.Class. All functions are
 * members of the JS object. All general utility functions (i.e. those not attached to a
 * particular class or module) should be placed here.
 * 
 * Do not assume any of these functions are part of the public API. They are essentially
 * plumbing for JS.Class's internals and may change or disappear in future releases.
 */

JS = {
  /**
   * Adds the properties of the second argument to the first, and returns the first. Will not
   * needlessly overwrite fields with identical values; if an object has inherited a property
   * we should not add the property to the object itself.
   * @param {Object} target
   * @param {Object} extensions
   * @returns {Object}
   */
  extend: function(target, extensions) {
    extensions = extensions || {};
    for (var prop in extensions) {
      if (target[prop] === extensions[prop]) continue;
      target[prop] = extensions[prop];
    }
    return target;
  },
  
  /**
   * Returns a function for use as a constructor. These functions are used as the basis for
   * classes. The constructor calls the object's initialize() method if it exists.
   * @returns {Function}
   */
  makeFunction: function() {
    return function() {
      return this.initialize
          ? (this.initialize.apply(this, arguments) || this)
          : this;
    };
  },
  
  /**
   * Takes a class and returns an instance of it, without calling the class's constructor.
   * Used for forging links between objects using JavaScript's inheritance model.
   * @param {Class} klass
   * @returns {Object}
   */
  makeBridge: function(klass) {
    var bridge = function() {};
    bridge.prototype = klass.prototype;
    return new bridge;
  },
  
  /**
   * Returns a function used to delegate a method call to a property of an object. Used for
   * faking a subclass with manual delegation to the parent class. For example:
   * 
   *     JS.delegate('mod', 'lookup')
   *     
   *     // -> function() { return this.mod.lookup.apply(this.mod, arguments); }
   * 
   * @param {String} property
   * @param {String} method
   * @returns {Function}
   */
  delegate: function(property, method) {
    return function() {
      return this[property][method].apply(this[property], arguments);
    };
  },
  
  /**
   * Takes a function and an object, and returns a new function that calls the original
   * function with 'this' set to refer to the object. Used to implement Object#method,
   * amongst other things.
   * @param {Function}
   * @param {Object}
   * @returns {Function}
   */
  bind: function() {
    var args = JS.array(arguments), method = args.shift(), object = args.shift() || null;
    return function() {
      return method.apply(object, args.concat(JS.array(arguments)));
    };
  },
  
  /**
   * Takes a function and returns true iff the function makes a call to callSuper(). Result
   * is cached on the function itself since functions are immutable and decompiling them
   * is expensive. We use this to determine whether to wrap the function when it's added
   * to a class; wrapping impedes performance and should be avoided where possible.
   * @param {Function} func
   * @returns {Boolean}
   */
  callsSuper: function(func) {
    return func.SUPER === undefined
        ? func.SUPER = /\bcallSuper\b/.test(func.toString())
        : func.SUPER;
  },
  
  /**
   * Disguises a function so that we cannot tell if it uses callSuper(). Sometimes we don't
   * want such functions to be wrapped by the inheritance system. Modifies the function's
   * toString() method and returns the function.
   * @param {Function} func
   * @returns {Function}
   */
  mask: function(func) {
    var string = func.toString().replace(/callSuper/g, 'super');
    func.toString = function() { return string };
    return func;
  },
  
  /**
   * Takes any iterable object (something with a 'length' property) and returns a native
   * JavaScript Array containing the same elements.
   * @param {Object} iterable
   * @returns {Array}
   */
  array: function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length, results = [];
    while (length--) results[length] = iterable[length];
    return results;
  },
  
  /**
   * Returns the index of the needle in the haystack, which is typically an Array or an
   * array-like object. Returns -1 if no matching element is found. We need this as older
   * IE versions don't implement Array#indexOf().
   * @param {Array} haystack
   * @param {Object} needle
   * @returns {Number}
   */
  indexOf: function(haystack, needle) {
    for (var i = 0, n = haystack.length; i < n; i++) {
      if (haystack[i] === needle) return i;
    }
    return -1;
  },
  
  /**
   * Returns true iff the argument is a function.
   * @param {Object} object
   * @returns {Boolean}
   */
  isFn: function(object) {
    return object instanceof Function;
  },
  
  /**
   * Used to determine whether a key-value pair should be added to a class or module. Pairs
   * may be ignored if they have some special function, like 'include' or 'extend'.
   * @param {String} key
   * @param {Object} object
   * @returns {Boolean}
   */
  ignore: function(key, object) {
    return /^(include|extend)$/.test(key) && typeof object === 'object';
  }
};

