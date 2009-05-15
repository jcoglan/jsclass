/** section: core
 * class JS.Class < JS.Module
 * 
 * `Class` is a subclass of `JS.Module`; classes not only store methods but also spawn
 * new objects. In addition, classes have an extra type of inheritance on top of mixins,
 * in that each class can have a single parent class from which it will inherit both
 * instance and singleton methods.
 * 
 * Refer to `JS.Module` for details of how inheritance is implemented in JS.Class. Though
 * `Class` is supposed to appear to be a subclass of `Module`, this relationship is
 * implemented by letting each `Class` hold a reference to an anonymous `Module` and
 * using manual delegation where necessary.
 **/
JS.Class = JS.makeFunction();
JS.extend(JS.Class.prototype = JS.makeBridge(JS.Module), {
  
  /**
   * new JS.Class(name, parent, methods)
   * - name (String): the name of the class, used for debugging
   * - parent (JS.Class): the parent class to inherit from
   * - methods (Object): list of methods for the class
   * 
   * The `name` and `parent` arguments are both optional and may be omitted. `name`
   * is not used to assign the class to a variable, it is only uses as metadata.
   * The default parent class is `Object`, and all classes include the JS.Kernel
   * module.
   **/
  initialize: function(name, parent, methods) {
    if (typeof name === 'string') {
      this.__nom__ = this.displayName = name;
    } else {
      this.__nom__ = this.displayName = '';
      methods = parent;
      parent = name;
    }
    var klass = JS.extend(JS.makeFunction(), this);
    klass.klass = klass.constructor = this.klass;
    
    if (!JS.isFn(parent)) {
      methods = parent;
      parent = Object;
    }
    
    // Set up parent-child relationship, then add methods. Setting up a parent
    // class in JavaScript wipes the existing prototype object.
    klass.inherit(parent);
    klass.include(methods, false);
    klass.resolve();
    
    // Fire inherited() callback on ancestors
    do {
      parent.inherited && parent.inherited(klass);
    } while (parent = parent.superclass);
    
    return klass;
  },
  
  /**
   * JS.Class#inherit(klass) -> undefined
   * - klass (JS.Class): the class to inherit from
   * 
   * Sets up the parent-child relationship to the parent class. This is a destructive action
   * in that the existing prototype will be discarded; always call this before adding any
   * methods to the class.
   **/
  inherit: function(klass) {
    this.superclass = klass;
    
    // Mix the parent's metamodule into this class's metamodule
    if (this.__eigen__ && klass.__eigen__) this.extend(klass.__eigen__(), true);
    
    this.subclasses = [];
    (klass.subclasses || []).push(this);
    
    // Bootstrap JavaScript's prototypal inheritance model
    var p = this.prototype = JS.makeBridge(klass);
    p.klass = p.constructor = this;
    
    // Set up a module to store methods and delegate calls to
    // -- Class does not really subclass Module, instead each
    // Class has a Module that it delegates to
    this.__mod__ = new JS.Module(this.__nom__, {}, {_resolve: this.prototype});
    this.include(JS.Kernel, false);
    
    if (klass !== Object) this.include(klass.__mod__ || new JS.Module(klass.prototype,
        {_resolve: klass.prototype}), false);
  },
  
  /**
   * JS.Class#include(module[, resolve = true[, options = {}]]) -> undefined
   * - module (JS.Module): the module to mix in
   * - resolve (Boolean): sets whether to refresh method tables afterward
   * - options (Object): flags to control execution
   * 
   * Mixes a `module` into the class if it's a `JS.Module` instance, or adds instance
   * methods to the class itself if given a plain old object. Overrides `JS.Module#include`
   * to make sure callbacks fire on the class rather than its delegating module.
   **/
  include: function(module, resolve, options) {
    if (!module) return;
    
    var mod     = this.__mod__,
        options = options || {};
    
    options._included = this;
    return mod.include(module, resolve, options);
  },
  
  /**
   * JS.Class#define(name, func[, resolve = true[, options = {}]]) -> undefined
   * - name (String): the name of the method
   * - func (Function): a function to implement the method
   * - resolve (Boolean): sets whether to refresh method tables afterward
   * - options (Object): options for internal use
   * 
   * Adds an instance method to the class with the given `name`. The `options` parameter is
   * for internal use to make sure callbacks fire on the correct objects, e.g. a class
   * uses a hidden module to store its methods, but callbacks should fire on the class,
   * not the module.
   **/
  define: function(name, func, resolve, options) {
    var module = this.__mod__;
    options = options || {};
    options._notify = this;
    module.define(name, func, resolve, options);
  }
});

