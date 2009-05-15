/** section: core
 * mixin JS.Kernel
 * 
 * `Kernel` is the base module; all classes include the `Kernel`, so its methods become
 * available to all objects instantiated by JS.Class. As in Ruby, the core `Object`
 * methods are implemented here rather than in the base `Object` class. JS.Class does
 * not in fact have an `Object` class and does not modify the builtin JavaScript `Object`
 * class either.
 **/
JS.Kernel = JS.extend(new JS.Module('Kernel', {
  /**
   * JS.Kernel#__eigen__() -> JS.Module
   * 
   * Returns the object's metamodule, analogous to calling `(class << self; self; end)`
   * in Ruby. Ruby's metaclasses are `Class`es, not just `Module`s, but so far I've not found
   * a compelling reason to enforce this. You cannot instantiate or subclass metaclasses
   * in Ruby, they only really exist to store methods so a module will suffice.
   **/
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    
    var me     = this.__nom__,
        klass  = this.klass.__nom__,
        name   = me || (klass ? '#<' + klass + '>' : ''),
        module = this.__meta__ = new JS.Module(name ? name + '.' : '', {}, {_resolve: this});
    
    module.include(this.klass.__mod__, false);
    return module;
  },
  
  /**
   * JS.Kernel#equals(object) -> Boolean
   * - object (Object): object to compare to the receiver
   * 
   * Returns `true` iff `object` is the same object as the receiver. Override to provide a
   * more meaningful comparison for use in sets, hashtables etc.
   **/
  equals: function(object) {
    return this === object;
  },
  
  /**
   * JS.Kernel#extend(module[, resolve = true]) -> undefined
   * - module (JS.Module): module with which to extend the object
   * - resolve (Boolean): whether to refresh method tables afterward
   * 
   * Extends the object using the methods from `module`. If `module` is an instance of
   * `JS.Module`, it becomes part of the object's inheritance chain and any methods added
   * directly to the object will take precedence. Pass `false` as a second argument
   * to prevent the method resolution process from firing.
   **/
  extend: function(module, resolve) {
    return this.__eigen__().include(module, resolve, {_extended: this});
  },
  
  /**
   * JS.Kernel#hash() -> String
   * 
   * Returns a hexadecimal hashcode for the object for use in hashtables. By default,
   * this is a random number guaranteed to be unique to the object. If you override
   * this method, make sure that `a.equals(b)` implies `a.hash() === b.hash()`.
   **/
  hash: function() {
    return this.__hashcode__ = this.__hashcode__ || JS.Kernel.getHashCode();
  },
  
  /**
   * JS.Kernel#isA(type) -> Boolean
   * - type (JS.Module): module or class to check the object's type against
   * 
   * Returns `true` iff the object is an instance of `type` or one of its
   * subclasses, or if the object's class includes the module `type`.
   **/
  isA: function(moduleOrClass) {
    return this.__eigen__().includes(moduleOrClass);
  },
  
  /**
   * JS.Kernel#method(name) -> Function
   * - name (String): the name of the required method
   * 
   * Returns the named method from the object as a bound function.
   **/
  method: function(name) {
    var self  = this,
        cache = self.__mcache__ = self.__mcache__ || {};
    
    if ((cache[name] || {}).fn === self[name]) return cache[name].bd;
    return (cache[name] = {fn: self[name], bd: JS.bind(self[name], self)}).bd;
  },
  
  /**
   * JS.Kernel#tap(block[, context]) -> this
   * - block (Function): block of code to execute
   * - context (Object): sets the binding of `this` within `block`
   * 
   * Executes the given function passing the object as a parameter, and returns the
   * object rather than the result of the function. Designed to 'tap into' a method
   * chain to inspect intermediate values. From the Ruby docs:
   * 
   *     list                   .tap(function(x) { console.log("original: ", x) })
   *         .toArray()         .tap(function(x) { console.log("array: ", x) })
   *         .select(condition) .tap(function(x) { console.log("evens: ", x) })
   *         .map(square)       .tap(function(x) { console.log("squares: ", x) })
   **/
  tap: function(block, context) {
    block.call(context || null, this);
    return this;
  }
}),

{
  __hashIndex__: 0,
  
  getHashCode: function() {
    this.__hashIndex__ += 1;
    return (Math.floor(new Date().getTime() / 1000) + this.__hashIndex__).toString(16);
  }
});

