/**
 * Copyright (c) 2007-2008 James Coglan
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 *
 * Parts of this software are derived from the following open-source projects:
 *
 * - The Prototype framework, (c) 2005-2007 Sam Stephenson
 * - Alex Arnell's Inheritance library, (c) 2006, Alex Arnell
 * - Base, (c) 2006-7, Dean Edwards
 */

JS = {
  extend: function(object, methods) {
    methods = methods || {};
    for (var prop in methods) object[prop] = methods[prop];
    return object;
  },
  
  method: function(name) {
    var self = this, cache = self.__mcache__ = self.__mcache__ || {};
    if ((cache[name] || {}).fn == self[name]) return cache[name].bd;
    return (cache[name] = {fn: self[name], bd: self[name].bind(self)}).bd;
  },
  
  makeFunction: function() {
    return function() {
      return this.initialize.apply(this, arguments) || this;
    };
  },
  
  makeBridge: function(klass) {
    var bridge = function() {};
    bridge.prototype = klass.prototype;
    return new bridge;
  },
  
  util: {}
};

Array.from = function(iterable) {
  if (!iterable) return [];
  if (iterable.toArray) return iterable.toArray();
  var length = iterable.length, results = [];
  while (length--) results[length] = iterable[length];
  return results;
};

JS.extend(Function.prototype, {
  bind: function() {
    var __method = this, args = Array.from(arguments), object = args.shift() || null;
    return function() {
      return __method.apply(object, args.concat(Array.from(arguments)));
    };
  },
  callsSuper: function() {
    return /\bcallSuper\b/.test(this.toString());
  }
});

Function.is = function(object) {
  return typeof object == 'function';
};

JS.Module = JS.makeFunction();
JS.extend(JS.Module.prototype, {
  initialize: function(methods, options) {
    options = options || {};
    this.__inc__ = [];
    this.__fns__ = {};
    this.__res__ = options.resolve || {};
    this.include(methods || {});
  },
  
  include: function(module) {
    if (!module) return;
    if (module.__inc__ && module.__fns__) this.__inc__.push(module);
    else JS.extend(this.__fns__, module);
    this.resolve();
  },
  
  includes: function(moduleOrClass) {
    if (Object == moduleOrClass || this == moduleOrClass || this.__res__ == moduleOrClass.prototype)
      return true;
    for (var i = 0, n = this.__inc__.length; i < n; i++) {
      if (this.__inc__[i].includes(moduleOrClass))
        return true;
    }
    return false;
  },
  
  lookup: function(name, lookInSelf) {
    var results = [], found, i, n;
    for (i = 0, n = this.__inc__.length; i < n; i++)
      results = results.concat(this.__inc__[i].lookup(name));
    if (lookInSelf !== false && (found = this.__fns__[name]))
      results.push(found);
    return results;
  },
  
  make: function(name, func) {
    if (!Function.is(func) || !func.callsSuper()) return func;
    var module = this;
    return function() {
      var supers = module.lookup(name, false), currentSuper = this.callSuper,
          args = Array.from(arguments), result;
      this.callSuper = function() {
        var i = arguments.length;
        while (i--) args[i] = arguments[i];
        return supers.pop().apply(this, args);
      };
      result = func.apply(this, arguments);
      currentSuper ? this.callSuper = currentSuper : delete this.callSuper;
      return result;
    };
  },
  
  resolve: function(target) {
    var target = target || this, resolved = target.__res__, i, n, key, made;
    for (i = 0, n = this.__inc__.length; i < n; i++)
      this.__inc__[i].resolve(target);
    for (key in this.__fns__) {
      made = target.make(key, this.__fns__[key]);
      if (resolved[key] != made) resolved[key] = made;
    }
  }
});

JS.ObjectMethods = new JS.Module({
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    var module = this.__meta__ = new JS.Module({}, {resolve: this});
    module.include(this.klass.__mod__);
    return module;
  },
  
  extend: function(module) {
    return this.__eigen__().include(module);
  },
  
  isA: function(moduleOrClass) {
    return this.__eigen__().includes(moduleOrClass);
  }
});

JS.Class = JS.makeFunction();
JS.extend(JS.Class.prototype = JS.makeBridge(JS.Module), {
  initialize: function(parent, methods) {
    var klass = JS.extend(JS.makeFunction(), this);
    klass.klass = klass.constructor = JS.Class;
    if (!Function.is(parent)) {
      methods = parent;
      parent = Object;
    }
    klass.inherit(parent);
    klass.include(methods);
    return klass;
  },
  
  inherit: function(klass) {
    this.superclass = klass;
    this.subclasses = [];
    (klass.subclasses || []).push(this);
    var p = this.prototype = JS.makeBridge(klass);
    p.klass = p.constructor = this;
    this.__mod__ = new JS.Module({}, {resolve: this.prototype});
    this.include(JS.ObjectMethods);
    this.include(klass.__mod__ || new JS.Module(klass.prototype));
  },
  
  include: function() {
    var mod = this.__mod__;
    return mod.include.apply(mod, arguments);
  },
  
  lookup: function() {
    var mod = this.__mod__;
    return mod.lookup.apply(mod, arguments);
  },
  
  resolve: function() {
    var mod = this.__mod__;
    return mod.resolve.apply(mod, arguments);
  }
});

JS.Module = new JS.Class(JS.Module.prototype);
JS.Class = new JS.Class(JS.Module, JS.Class.prototype);
JS.Module.klass = JS.Module.constructor =
JS.Class.klass = JS.Class.constructor = JS.Class;
JS.ObjectMethods = new JS.Module(JS.ObjectMethods.__fns__);
JS.extend(JS.Module, JS.ObjectMethods.__fns__);
JS.extend(JS.Class, JS.ObjectMethods.__fns__);
