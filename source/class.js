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
  
  makeFn: function() {
    return function() {
      return this.initialize.apply(this, arguments) || this;
    };
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

JS.Module = JS.makeFn();
JS.extend(JS.Module.prototype, {
  initialize: function(methods, options) {
    options = options || {};
    this.__inc__ = [];
    this.__fns__ = {};
    this.__res__ = options.resolve || {};
    this.include(methods || {});
  },
  
  include: function(module) {
    var isMod = (module instanceof JS.Module), key;
    isMod ? this.__inc__.push(module)
          : JS.extend(this.__fns__, module);
    this.resolve();
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
    if (!func.callsSuper()) return func;
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
    var target = target || this, resolved = target.__res__, i, n, key;
    for (i = 0, n = this.__inc__.length; i < n; i++)
      this.__inc__[i].resolve(target);
    for (key in this.__fns__)
      resolved[key] = target.make(key, this.__fns__[key]);
  }
});

JS.Class = JS.makeFn();
JS.extend(JS.Class.prototype, {
  initialize: function(methods) {
    var klass = JS.extend(JS.makeFn(), this);
    klass.__mod__ = new JS.Module({}, {resolve: klass.prototype});
    klass.include(methods);
    return klass;
  },
  
  include: function() {
    var mod = this.__mod__;
    return mod.include.apply(mod, arguments);
  },
  
  lookup: function() {
    var mod = this.__mod__;
    return mod.lookup.apply(mod, arguments);
  },
  
  make: function() {
    var mod = this.__mod__;
    return mod.make.apply(mod, arguments);
  },
  
  resolve: function() {
    var mod = this.__mod__;
    return mod.resolve.apply(mod, arguments);
  }
});

JS.Module = new JS.Class(JS.Module.prototype);
JS.Class = new JS.Class(JS.Class.prototype);
