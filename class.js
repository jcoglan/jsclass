if (typeof JS == 'undefined') JS = {};

JS.Class = function() {
    var args = Array.from(arguments), arg;
    var parent = (typeof args[0] == 'function') ? args.shift() : null;
    var klass = arguments.callee.create(parent);
    while (arg = args.shift()) klass.include(arg);
    return klass;
};

(function(object, methods) {
    for (var prop in methods) object[prop] = methods[prop];
})(JS.Class, {
    
    create: function(parent) {
        var klass = function() {
            this.initialize.apply(this, arguments);
            this.initialize = undefined;
        };
        this.ify(klass);
        if (parent) this.subclass(parent, klass);
        var p = klass.prototype;
        p.klass = p.constructor = klass;
        klass.include(this.INSTANCE_METHODS, false);
        return klass;
    },
    
    ify: function(klass, noExtend) {
        klass.superclass = klass.superclass || Object;
        klass.subclasses = klass.subclasses || [];
        if (noExtend === false) return klass;
        for (var method in this.CLASS_METHODS)
            klass[method] = this.CLASS_METHODS[method];
        return klass;
    },
    
    subclass: function(superclass, klass) {
        this.ify(superclass, false);
        klass.superclass = superclass;
        superclass.subclasses.push(klass);
        var bridge = function() {};
        bridge.prototype = superclass.prototype;
        klass.prototype = new bridge();
        klass.extend(superclass);
        if (typeof superclass.inherited == 'function') superclass.inherited(klass);
        return klass;
    },
    
    addMethod: function(klass, object, superObject, name, func) {
        if (typeof func != 'function') return (object[name] = func);
        if (!func.callsSuper()) return (object[name] = func);
        
        var method = function() {
            var _super = superObject[name], args = Array.from(arguments), currentSuper = this._super, result;
            if (typeof _super == 'function') this._super = function() {
                var i = arguments.length;
                while (i--) args[i] = arguments[i];
                return _super.apply(this, args);
            };
            try { result = func.apply(this, arguments); }
            catch (e) { throw e; }
            finally {
                if (currentSuper) this._super = currentSuper;
                else delete this._super;
            }
            return result;
        };
        method.valueOf = function() { return func; };
        method.toString = function() { return func.toString(); };
        object[name] = method;
    },
    
    INSTANCE_METHODS: {
        initialize: function() {},
        
        method: function(name) {
            if (typeof this[name] != 'function') throw new Error('object does not have a ' + name + '() method');
            return this[name].bind(this);
        },
        
        isA: function(klass) {
            var _class = this.klass;
            while (_class) {
                if (_class === klass) return true;
                _class = _class.superclass;
            }
            return false;
        }
    },
    
    CLASS_METHODS: {
        include: function(source, overwrite) {
            var modules, i, n, inc = source.include, ext = source.extend;
            if (inc) {
                modules = (inc instanceof Array) ? inc : [inc];
                for (i = 0, n = modules.length; i < n; i++)
                    this.include(modules[i]);
            }
            if (ext) {
                modules = (ext instanceof Array) ? ext : [ext];
                for (i = 0, n = modules.length; i < n; i++)
                    this.extend(modules[i]);
            }
            for (var method in source) {
                if (!/^(?:included?|extend)$/.test(method))
                    this.method(method, source[method], overwrite);
            }
            if (typeof source.included == 'function') source.included(this);
            return this;
        },
        
        method: function(name, func, overwrite) {
            if (!this.prototype[name] || overwrite !== false)
                JS.Class.addMethod(this, this.prototype, this.superclass.prototype, name, func);
            return this;
        },
        
        extend: function(source, overwrite) {
            if (typeof source == 'function') source = JS.Class.properties(source);
            for (var method in source) this.classMethod(method, source[method], overwrite);
            return this;
        },
        
        classMethod: function(name, func, overwrite) {
            for (var i = 0, n = this.subclasses.length; i < n; i++)
                this.subclasses[i].classMethod(name, func, false);
            if (!this[name] || overwrite !== false)
                JS.Class.addMethod(this, this, this.superclass, name, func);
            return this;
        }
    },
    
    properties: function(klass) {
        var properties = {}, prop;
        loop: for (var method in klass) {
            for (prop in this.ify(function(){}))
                if (method == prop) continue loop;
            properties[method] = klass[method];
        }
        return properties;
    }
});

Function.prototype.callsSuper = function() {
    return /\b_super\b/.test(this.toString());
};

Function.prototype.bind = function() {
    if (arguments.length < 2 && arguments[0] === undefined) return this;
    var __method = this, args = Array.from(arguments), object = args.shift();
    return function() {
        return __method.apply(object, args.concat(Array.from(arguments)));
    };
};

Array.from = function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
};
