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
  extend: function(object, methods, options) {
    methods = methods || {};
    options = options || {};
    for (var prop in methods) {
      if (object[prop] == methods[prop]) continue;
      if (options.exclude && options.exclude(prop, methods[prop])) continue;
      object[prop] = methods[prop];
      if (JS.Module.__notify__ && options.notify && this.util.isFn(object[prop]))
        JS.Module.__notify__(prop, options.notify);
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
  
  util: {
    bind: function() {
      var args = JS.util.array(arguments), method = args.shift(), object = args.shift() || null;
      return function() {
        return method.apply(object, args.concat(JS.util.array(arguments)));
      };
    },
    
    callsSuper: function(func) {
      return /\bcallSuper\b/.test(func.toString());
    },
    
    array: function(iterable) {
      if (!iterable) return [];
      if (iterable.toArray) return iterable.toArray();
      var length = iterable.length, results = [];
      while (length--) results[length] = iterable[length];
      return results;
    },
    
    isFn: function(object) {
      return object instanceof Function;
    },
    
    ignore: function(key, object) {
      return /^(include|extend)$/.test(key) && typeof object == 'object';
    }
  }
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
  
  include: function(module, options, resolve) {
    if (!module) return resolve && this.resolve();
    options = options || {};
    var inc = module.include, ext = module.extend, modules, i, n;
    if (module.__inc__ && module.__fns__) {
      this.__inc__.push(module);
      if (module.extended && options.extended) module.extended(options.extended);
      else module.included && module.included(options.included || this);
    }
    else {
      if (typeof inc == 'object') {
        modules = [].concat(inc);
        for (i = 0, n = modules.length; i < n; i++)
          this.include(modules[i], options);
      }
      if (typeof ext == 'object') {
        modules = [].concat(ext);
        for (i = 0, n = modules.length; i < n; i++)
          (options.included || this).extend(modules[i], false);
        (options.included || this).extend();
      }
      JS.extend(this.__fns__, module, {exclude: JS.util.ignore,
          notify: options.included || options.extended});
    }
    resolve && this.resolve();
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
    if (!JS.util.isFn(func) || !JS.util.callsSuper(func)) return func;
    var module = this;
    return function() {
      var supers = module.lookup(name, false), currentSuper = this.callSuper,
          args = JS.util.array(arguments), result;
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
  
  extend: function(module, resolve) {
    return this.__eigen__().include(module, {extended: this}, resolve !== false);
  },
  
  isA: function(moduleOrClass) {
    return this.__eigen__().includes(moduleOrClass);
  },
  
  method: function(name) {
    var self = this, cache = self.__mcache__ = self.__mcache__ || {};
    if ((cache[name] || {}).fn == self[name]) return cache[name].bd;
    return (cache[name] = {fn: self[name], bd: JS.util.bind(self[name], self)}).bd;
  }
});

JS.Class = JS.makeFunction();
JS.extend(JS.Class.prototype = JS.makeBridge(JS.Module), {
  initialize: function(parent, methods) {
    var klass = JS.extend(JS.makeFunction(), this);
    klass.klass = klass.constructor = JS.Class;
    if (!JS.util.isFn(parent)) {
      methods = parent;
      parent = Object;
    }
    klass.inherit(parent);
    klass.include(methods, null, false);
    klass.resolve();
    do {
      parent.inherited && parent.inherited(klass);
    } while (parent = parent.superclass);
    return klass;
  },
  
  inherit: function(klass) {
    this.superclass = klass;
    this.subclasses = [];
    (klass.subclasses || []).push(this);
    var p = this.prototype = JS.makeBridge(klass);
    p.klass = p.constructor = this;
    this.__mod__ = new JS.Module({}, {resolve: this.prototype});
    this.include(JS.ObjectMethods, null, false);
    this.include(klass.__mod__ || new JS.Module(klass.prototype, {resolve: klass.prototype}), null, false);
    this.extend();
  },
  
  include: function(module, options, resolve) {
    if (!module) return;
    var mod = this.__mod__, options = options || {};
    options.included = this;
    return mod.include(module, options, resolve !== false);
  },
  
  __eigen__: function() {
    if (this.__meta__) return this.__meta__;
    var module = this.callSuper();
    var parent = this.superclass;
    module.include(parent.__eigen__ ? parent.__eigen__() : new JS.Module(parent.prototype));
    return module;
  },
  
  extend: function(module) {
    if (!this.callSuper) return;
    this.callSuper();
    for (var i = 0, n = this.subclasses.length; i < n; i++)
      this.subclasses[i].extend();
  },
  
  includes: function() {
    var mod = this.__mod__;
    return mod.includes.apply(mod, arguments);
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

JS.Module = JS.extend(new JS.Class(JS.Module.prototype), JS.ObjectMethods.__fns__);
JS.Module.include(JS.ObjectMethods);
JS.Class = JS.extend(new JS.Class(JS.Module, JS.Class.prototype), JS.ObjectMethods.__fns__);
JS.Module.klass = JS.Module.constructor =
JS.Class.klass = JS.Class.constructor = JS.Class;
JS.ObjectMethods = new JS.Module(JS.ObjectMethods.__fns__);

JS.Module.extend({
  __obs__: [],
  methodAdded: function(block, context) {
    this.__obs__.push([block, context]);
  },
  __notify__: function(name, object) {
    var obs = this.__obs__;
    for (var i = 0, n = obs.length; i < n; i++)
      obs[i][0].call(obs[i][1] || null, name, object);
  }
});

JS.extend(JS, {
  Interface: new JS.Class({
    initialize: function(methods) {
      this.test = function(object, returnName) {
        var n = methods.length;
        while (n--) {
          if (!JS.util.isFn(object[methods[n]]))
            return returnName ? methods[n] : false;
        }
        return true;
      };
    },
    
    extend: {
      ensure: function() {
        var args = JS.util.array(arguments), object = args.shift(), face, result;
        while (face = args.shift()) {
          result = face.test(object, true);
          if (result !== true) throw new Error('object does not implement ' + result + '()');
        }
      }
    }
  }),
  
  Singleton: new JS.Class({
    initialize: function(parent, methods) {
      return new (new JS.Class(parent, methods));
    }
  })
});
