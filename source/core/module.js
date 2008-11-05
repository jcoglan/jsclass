/**
 * Module is the core class in JS.Class. A module is simply an object that stores methods,
 * and is responsible for handling method lookups, inheritance relationships and the like.
 * All of Ruby's inheritance semantics are handled using modules in JS.Class.
 * 
 * The basic object/module/class model in Ruby is expressed in the diagram at
 * http://ruby-doc.org/core/classes/Class.html -- Class inherits from Module, which
 * inherits from Object (as do all custom classes). Kernel is a Module which is mixed
 * into Object to provide methods common to all objects.
 * 
 * In JS.Class, there is no Object class, but we do have Module, Class and Kernel. All
 * top-level (parentless) classes include the Kernel module, so all classes in effect
 * inherit from Kernel. All classes are instances of Class, and all modules instances of
 * Module. Module is a top-level class, from which Class inherits.
 * 
 * The following diagram shows this relationship; vertical lines indicate parent/child
 * class relationships, horizontal lines indicate module inclusions. (C) means a class,
 * (M) a module.
 * 
 * 
 *      ==============      ==============      ==================      ==============
 *      | M | Kernel |----->| C | Module |      | C | OtherClass |<-----| M | Kernel |
 *      ==============      ==============      ==================      ==============
 *                                ^                     ^
 *                                |                     |
 *                                |                     |
 *                          =============       ==================
 *                          | C | Class |       | C | ChildClass |
 *                          =============       ==================
 * 
 * 
 * All objects have a metamodule attached to them; this handles storage of singleton
 * methods as metaclasses do in Ruby. This is handled by mixing the object's class into
 * the object's metamodule.
 * 
 * 
 *                class
 *          =================
 *          | C | SomeClass | -----------------------------------------------
 *          =================                                               |
 *                  |                                                       |
 *                  V                                                       |
 *          ====================      =================================     |
 *          | <SomeClass:0xb7> |<>----| M | <Module:<SomeClass:0xb7>> |<-----
 *          ====================      =================================
 *                instance                       metamodule
 * 
 * 
 * Similarly, inheritance of class methods is handled by mixing the parent class's
 * metamodule into the child class's metamodule, like so:
 * 
 * 
 *            ==================      ===========================
 *            | C | OtherClass |<>----| M | <Module:OtherClass> |------
 *            ==================      ===========================     |
 *                    ^                                               |
 *                    |                                               |
 *                    |                                               |
 *            ==================      ===========================     |
 *            | C | ChildClass |<>----| M | <Module:ChildClass> |<-----
 *            ==================      ===========================
 * 
 * 
 * The parent-child relationships are also implemented using module inclusion, with some
 * extra checks and optimisations. Also, bear in mind that although Class appears to be a
 * subclass of Module, this particular parent-child relationship is faked using manual
 * delegation; every class has a hidden module attached to it that handles all the method
 * storage and lookup responsibilities.
 * 
 * @constructor
 * @class Module
 */
JS.Module = JS.makeFunction();
JS.extend(JS.Module.prototype, /** @scope Module.prototype */{
  /**
   * @param {Object} methods
   * @param {Object} options
   */
  initialize: function(methods, options) {
    options = options || {};
    this.__mod__ = this;
    this.__inc__ = [];
    this.__fns__ = {};
    this.__dep__ = [];
    this.__res__ = options._resolve || null;
    this.include(methods || {});
  },
  
  /**
   * @param {String} name
   * @param {Function} func
   * @param {Object} options
   */
  define: function(name, func, options) {
    options = options || {};
    this.__fns__[name] = func;
    if (JS.Module._notify && options._notify && JS.isFn(func))
        JS.Module._notify(name, options._notify);
    var i = this.__dep__.length;
    while (i--) this.__dep__[i].resolve();
  },
  
  /**
   * @param {String} name
   * @returns {Function}
   */
  instanceMethod: function(name) {
    var method = this.lookup(name).pop();
    return JS.isFn(method) ? method : null;
  },
  
  /**
   * @param {Module|Object} module
   * @param {Object} options
   * @param {Boolean} resolve
   */
  include: function(module, options, resolve) {
    if (!module) return resolve && this.resolve();
    options = options || {};
    var inc = module.include, ext = module.extend, modules, i, n, method,
        includer = options._included || this;
    
    if (module.__inc__ && module.__fns__) {
      this.__inc__.push(module);
      module.__dep__.push(this);
      if (options._extended) module.extended && module.extended(options._extended);
      else module.included && module.included(includer);
    }
    else {
      if (options._recall) {
        for (method in module) {
          if (JS.ignore(method, module[method])) continue;
          this.define(method, module[method], {_notify: includer || options._extended || this});
        }
      } else {
        if (typeof inc === 'object') {
          modules = [].concat(inc);
          for (i = 0, n = modules.length; i < n; i++)
            includer.include(modules[i], options);
        }
        if (typeof ext === 'object') {
          modules = [].concat(ext);
          for (i = 0, n = modules.length; i < n; i++)
            includer.extend(modules[i], false);
          includer.extend();
        }
        options._recall = true;
        return includer.include(module, options, resolve);
      }
    }
    resolve && this.resolve();
  },
  
  /**
   * @param {Module} module
   * @returns {Boolean}
   */
  includes: function(module) {
    if (Object === module || this === module || this.__res__ === module.prototype)
      return true;
    var i = this.__inc__.length;
    while (i--) {
      if (this.__inc__[i].includes(module))
        return true;
    }
    return false;
  },
  
  /**
   * @param {Array} results
   * @returns {Array}
   */
  ancestors: function(results) {
    results = results || [];
    for (var i = 0, n = this.__inc__.length; i < n; i++)
      this.__inc__[i].ancestors(results);
    var klass = (this.__res__||{}).klass,
        result = (klass && this.__res__ === klass.prototype) ? klass : this;
    if (JS.indexOf(results, result) === -1) results.push(result);
    return results;
  },
  
  /**
   * @param {String} name
   * @returns {Function}
   */
  lookup: function(name) {
    var ancestors = this.ancestors(), results = [], i, n, method;
    for (i = 0, n = ancestors.length; i < n; i++) {
      method = ancestors[i].__mod__.__fns__[name];
      if (method) results.push(method);
    }
    return results;
  },
  
  /**
   * @param {String} name
   * @param {Function} func
   * @returns {Function}
   */
  make: function(name, func) {
    if (!JS.isFn(func) || !JS.callsSuper(func)) return func;
    var module = this;
    return function() {
      return module.chain(this, name, arguments);
    };
  },
  
  /**
   * @param {Object} self
   * @param {String} name
   * @param {Array} args
   * @returns {Object}
   */
  chain: JS.mask( function(self, name, args) {
    var callees = this.lookup(name),
        stackIndex = callees.length - 1,
        currentSuper = self.callSuper,
        params = JS.array(args),
        result;
    
    self.callSuper = function() {
      var i = arguments.length;
      while (i--) params[i] = arguments[i];
      stackIndex -= 1;
      var returnValue = callees[stackIndex].apply(self, params);
      stackIndex += 1;
      return returnValue;
    };
    
    result = callees.pop().apply(self, params);
    currentSuper ? self.callSuper = currentSuper : delete self.callSuper;
    return result;
  } ),
  
  /**
   * @param {Object} target
   */
  resolve: function(target) {
    var target = target || this, resolved = target.__res__, i, n, key, made;
    
    if (target === this) {
      i = this.__dep__.length;
      while (i--) this.__dep__[i].resolve();
    }
    
    if (!resolved) return;
    
    for (i = 0, n = this.__inc__.length; i < n; i++)
      this.__inc__[i].resolve(target);
    for (key in this.__fns__) {
      made = target.make(key, this.__fns__[key]);
      if (resolved[key] !== made) resolved[key] = made;
    }
  }
});

