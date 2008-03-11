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
    for (var prop in methods) object[prop] = methods[prop];
  }
};

(function(list, JS, extend, INSTANCE_METHODS, CLASS_METHODS,
    prototype, superclass, subclasses, addMethod, excluded, method, lambda) {
  
  var Class = JS.Class = function() {
    var args = list(arguments), arg,
        parent = lambda(args[0]) ? args.shift() : null,
        klass = Class.create(parent);
    
    while (arg = args.shift())
      klass.include(arg);
    
    parent && lambda(parent.inherited) &&
      parent.inherited(klass);
    
    return klass;
  };
  
  extend(Function[prototype], {
    bind: function() {
      var __method = this, args = list(arguments), object = args.shift() || null;
      return function() {
        return __method.apply(object, args.concat(list(arguments)));
      };
    },
    callsSuper: function() {
      return /\bcallSuper\b/.test(this.toString());
    }
  });
  
  extend(Class, {
    create: function(parent) {
      var klass = function() {
        this.initialize.apply(this, arguments);
      };
      Class.ify(klass);
      parent && Class.subclass(parent, klass);
      var p = klass[prototype];
      p.klass = p.constructor = klass;
      klass.include(Class[INSTANCE_METHODS], false);
      klass.instanceMethod('extend', Class[INSTANCE_METHODS].extend, false);
      return klass;
    },
    
    ify: function(klass, noExtend) {
      klass[superclass] = klass[superclass] || Object;
      klass[subclasses] = klass[subclasses] || [];
      if (noExtend === false) return klass;
      for (var method in Class[CLASS_METHODS])
        Class[CLASS_METHODS].hasOwnProperty(method) &&
          (klass[method] = Class[CLASS_METHODS][method]);
      return klass;
    },
    
    subclass: function(superklass, klass) {
      Class.ify(superklass, false);
      klass[superclass] = superklass;
      superklass[subclasses].push(klass);
      var bridge = function() {};
      bridge[prototype] = superklass[prototype];
      klass[prototype] = new bridge();
      klass.extend(superklass);
      return klass;
    },
    
    properties: function(klass) {
      var properties = {}, prop, K = Class.ify(function(){});
      loop: for (var method in klass) {
        for (prop in K) { if (method == prop) continue loop; }
        properties[method] = klass[method];
      }
      return properties;
    }
  });
  
  Class[addMethod] = function(object, superObject, name, func) {
    if (!lambda(func)) return (object[name] = func);
    if (!func.callsSuper()) return (object[name] = func);
    
    var method = function() {
      var _super = superObject[name], args = list(arguments), currentSuper = this.callSuper, result;
      lambda(_super) && (this.callSuper = function() {
        var i = arguments.length;
        while (i--) args[i] = arguments[i];
        return _super.apply(this, args);
      });
      result = func.apply(this, arguments);
      currentSuper ? this.callSuper = currentSuper : delete this.callSuper;
      return result;
    };
    method.valueOf = function() { return func; };
    method.toString = function() { return func.toString(); };
    object[name] = method;
  };
  
  Class[INSTANCE_METHODS] = {
    initialize: function() {},
    
    method: method,
    
    extend: function(source) {
      for (var method in source)
        source.hasOwnProperty(method) &&
          Class[addMethod](this, this.klass[prototype], method, source[method]);
      return this;
    },
    
    isA: function(klass) {
      var _class = this.klass;
      while (_class) {
        if (_class === klass) return true;
        _class = _class[superclass];
      }
      return false;
    }
  };
  
  Class[CLASS_METHODS] = {
    include: function(source, overwrite) {
      var modules, i, n, inc = source.include, ext = source.extend;
      if (inc) {
        modules = [].concat(inc);
        for (i = 0, n = modules.length; i < n; i++)
          this.include(modules[i], overwrite);
      }
      if (ext) {
        modules = [].concat(ext);
        for (i = 0, n = modules.length; i < n; i++)
          this.extend(modules[i], overwrite);
      }
      for (var method in source) {
        !excluded.test(method) &&
          this.instanceMethod(method, source[method], overwrite);
      }
      lambda(source.included) && source.included(this);
      return this;
    },
    
    instanceMethod: function(name, func, overwrite) {
      if (!this[prototype][name] || overwrite !== false)
        Class[addMethod](this[prototype], this[superclass][prototype], name, func);
      return this;
    },
    
    extend: function(source, overwrite) {
      lambda(source) && (source = Class.properties(source));
      for (var method in source) {
        source.hasOwnProperty(method) && !excluded.test(method) &&
          this.classMethod(method, source[method], overwrite);
      }
      lambda(source.extended) && source.extended(this);
      return this;
    },
    
    classMethod: function(name, func, overwrite) {
      for (var i = 0, n = this[subclasses].length; i < n; i++)
        this[subclasses][i].classMethod(name, func, false);
      (!this[name] || overwrite !== false) &&
        Class[addMethod](this, this[superclass], name, func);
      return this;
    },
    
    method: method
  };
  
  extend(JS, {
    Interface: Class({
      initialize: function(methods) {
        this.test = function(object, returnName) {
          var n = methods.length;
          while (n--) {
            if (!lambda(object[methods[n]]))
              return returnName ? methods[n] : false;
          }
          return true;
        };
      },
      
      extend: {
        ensure: function() {
          var args = list(arguments), object = args.shift(), face, result;
          while (face = args.shift()) {
            result = face.test(object, true);
            if (result !== true) throw new Error('object does not implement ' + result + '()');
          }
        }
      }
    }),
    
    Singleton: function() {
      return new (Class.apply(JS, arguments));
    },
    
    Module: function(source) {
      return {
        included: function(klass) { klass.include(source); },
        extended: function(klass) { klass.extend(source); }
      };
    }
  });
  
})(
  Array.from = function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length, results = [];
    while (length--) results[length] = iterable[length];
    return results;
  },
  
  JS, JS.extend,
  'INSTANCE_METHODS', 'CLASS_METHODS',
  'prototype', 'superclass', 'subclasses', 'addMethod',
  /^(included?|extend(ed)?)$/,
  
  function(name) {
    var self = this, cache = self._methods = self._methods || {};
    if ((cache[name] || {}).fn == self[name]) return cache[name].bd;
    return (cache[name] = {fn: self[name], bd: self[name].bind(self)}).bd;
  },
  
  function(object) {
    return typeof object == 'function';
  }
);
