/**
 * Class is a subclass of Module; classes not only store methods but also spawn new
 * objects. In addition, classes have an extra type of inheritance on top of mixins,
 * in that each class can have a single parent class from which it will inherit both
 * instance and singleton methods.
 * 
 * Refer to Module for details of how inheritance is implemented in JS.Class. Though
 * Class is supposed to appear to be a subclass of Module, this relationship is
 * implemented by letting each Class hold a reference to an anonymous Module and
 * using manual delegation where necessary.
 * 
 * @constructor
 * @class Class
 * @extends Module
 */
JS.Class = JS.makeFunction();
JS.extend(JS.Class.prototype = JS.makeBridge(JS.Module), /** @scope Class.prototype */{
  
  /**
   * @param {Class} parent
   * @param {Object} methods
   * @returns {Class}
   */
  initialize: function(parent, methods) {
    var klass = JS.extend(JS.makeFunction(), this);
    klass.klass = klass.constructor = this.klass;
    if (!JS.isFn(parent)) {
      methods = parent;
      parent = Object;
    }
    
    // Set up parent-child relationship, then add methods. Setting up a parent
    // class in JavaScript wipes the existing prototype object.
    klass.inherit(parent);
    klass.include(methods, null, false);
    klass.resolve();
    
    // Fire inherited() callback on ancestors
    do {
      parent.inherited && parent.inherited(klass);
    } while (parent = parent.superclass);
    
    return klass;
  },
  
  /**
   * Sets up the parent-child relationship to the parent class. This is a destructive action
   * in that the existing prototype will be discarded; always call this before adding any
   * methods to the class.
   * 
   * @param {Class} klass
   */
  inherit: function(klass) {
    this.superclass = klass;
    
    // Mix the parent's metamodule into this class's metamodule
    if (this.__eigen__) {
      this.__eigen__().include(klass.__eigen__
          ? klass.__eigen__()
          : new JS.Module(klass.prototype));
      this.__meta__.resolve();
    }
    
    this.subclasses = [];
    (klass.subclasses || []).push(this);
    
    // Bootstrap JavaScript's prototypal inheritance model
    var p = this.prototype = JS.makeBridge(klass);
    p.klass = p.constructor = this;
    
    // Set up a module to store methods and delegate calls to
    // -- Class does not really subclass Module, instead each
    // Class has a Module that it delegates to
    this.__mod__ = new JS.Module({}, {_resolve: this.prototype});
    this.include(JS.Kernel, null, false);
    
    if (klass !== Object) this.include(klass.__mod__ || new JS.Module(klass.prototype,
        {_resolve: klass.prototype}), null, false);
  },
  
  /**
   * Mixes a module into the class if it's Module instance, or adds instance methods to
   * the class itself if given a plain old object. Overrides Module#include to make sure
   * callbacks fire on the class rather than its delegating module.
   * 
   * @param {Module|Object} module
   * @param {Object} options
   * @param {Boolean} resolve
   */
  include: function(module, options, resolve) {
    if (!module) return;
    var mod = this.__mod__, options = options || {};
    options._included = this;
    return mod.include(module, options, resolve !== false);
  },
  
  /**
   * Adds an instance method to the class with the given name. The options parameter is
   * for internal use to make sure callbacks fire on the correct objects, e.g. a class
   * uses a hidden module to store its methods, but callbacks should fire on the class,
   * not the module.
   * 
   * @param {String} name
   * @param {Function} func
   * @param {Object} options
   */
  define: function(name, func, options) {
    var module = this.__mod__;
    options = options || {};
    options._notify = this;
    module.define(name, func, options);
    module.resolve();
  },
  
  // These methods are not overriden by Class and refer properties that classes
  // do not have, therefore we need to explicitly delegate calls to a module
  includes:   JS.delegate('__mod__', 'includes'),
  ancestors:  JS.delegate('__mod__', 'ancestors'),
  resolve:    JS.delegate('__mod__', 'resolve')
});

