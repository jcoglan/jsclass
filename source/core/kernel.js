/**
 * Kernel is the base module; all classes include the Kernel, so its methods become
 * available to all objects instantiated by JS.Class. As in Ruby, the core Object
 * methods are implemented here rather than in the base Object class. JS.Class does
 * not in fact have an Object class and does not modify the builtin JavaScript Object
 * class either.
 * 
 * @module Kernel
 */
JS.Kernel = new JS.Module(/** @scope Kernel.prototype */{
  /**
   * Returns the object's metamodule, analogous to calling (class << self; self; end)
   * in Ruby. Ruby's metaclasses are Classes, not just Modules, but so far I've not found
   * a compelling reason to enforce this. You cannot ins
   * @returns {Module}
   */
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    var module = this.__meta__ = new JS.Module({}, {_resolve: this});
    module.include(this.klass.__mod__);
    return module;
  },
  
  /**
   * Extends the object using the methods from module. If module is an instance of
   * Module, it becomes part of the object's inheritance chain and any methods added
   * directly to the object will take precedence. Pass false as a second argument
   * to prevent the method resolution process from firing.
   * @param {Module|Object} module
   * @param {Boolean} resolve
   */
  extend: function(module, resolve) {
    return this.__eigen__().include(module, {_extended: this}, resolve !== false);
  },
  
  /**
   * Returns true if the object is an instance of moduleOrClass or one of its
   * subclasses, or if the object's class includes the module moduleOrClass.
   * @param {Module|Class} moduleOrClass
   * @returns {Boolean}
   */
  isA: function(moduleOrClass) {
    return this.__eigen__().includes(moduleOrClass);
  },
  
  /**
   * Returns the named method from the object as a bound function.
   * @param {String} name
   * @returns {Function}
   */
  method: function(name) {
    var self = this, cache = self.__mcache__ = self.__mcache__ || {};
    if ((cache[name] || {}).fn === self[name]) return cache[name].bd;
    return (cache[name] = {fn: self[name], bd: JS.bind(self[name], self)}).bd;
  },
  
  /**
   * Executes the given function passing the object as a parameter, and returns the
   * object rather than the result of the function. Designed to 'tap into' a method
   * chain to inspect intermediate values. From the Ruby docs:
   * 
   *     list                   .tap(function(x) { console.log("original: ", x) })
   *         .toArray()         .tap(function(x) { console.log("array: ", x) })
   *         .select(condition) .tap(function(x) { console.log("evens: ", x) })
   *         .map(square)       .tap(function(x) { console.log("squares: ", x) })
   * 
   * @param {Function} block
   * @param {Object} scope
   * @returns {Object}
   */
  tap: function(block, scope) {
    block.call(scope || null, this);
    return this;
  }
});

