if (typeof JS == 'undefined') JS = {};

JS.Class = function() {
    if (arguments.length > 1 && typeof arguments[0] == 'undefined')
        throw new ReferenceError('Parent class is not defined');
    var args = Array.from(arguments), arg;
    var parent = (typeof args[0] == 'function') ? args.shift() : null;
    var klass = JS.Class.extend(parent);
    while (arg = args.shift()) klass.include(arg);
    return klass;
};

JS.Class.extend = function(parent) {
    var klass = function() {
        this.klass = arguments.callee;
        JS.Class.setup(this);
        if (typeof this.initialize == 'function')
            this.initialize.apply(this, arguments);
    };
    JS.Class.ify(klass);
    if (typeof parent == 'function') JS.Class.subclass(parent, klass);
    klass.include(JS.Class.INSTANCE_METHODS, false);
    return klass;
};

JS.Class.ify = function(klass, noExtend) {
    if (typeof klass != 'function') return;
    klass.superclass        = klass.superclass || Object;
    klass.subclasses        = klass.subclasses || [];
    if (noExtend === false) return klass;
    for (var method in JS.Class.CLASS_METHODS)
        klass[method] = JS.Class.CLASS_METHODS[method];
    return klass;
};

JS.Class.subclass = function(superclass, klass) {
    if (typeof superclass != 'function' || typeof klass != 'function') return;
    if (klass.superclass && klass.superclass !== Object)
        throw new ReferenceError('A class may only have one superclass');
    JS.Class.ify(superclass, false);
    klass.superclass = superclass;
    superclass.subclasses.push(klass);
    var bridge = function() {};
    bridge.prototype = superclass.prototype;
    klass.prototype = new bridge();
    klass.extend(superclass);
    return klass;
};

JS.Class.setup = function(instance) {
    var bind;
    if (bind = instance.klass.bindMethods)
        bind(instance);
};

JS.Class.bindMethods = function(instance) {
    for (var methodName in instance)
        (function(method) {
            var bound = instance[method];
            if (typeof bound != 'function' || method == 'klass') return;
            instance[method] = bound.bind(instance);
            instance[method].valueOf = function() { return bound; };
            instance[method].toString = function() { return bound.toString(); };
        })(methodName);
};

JS.Class.addMethod = function(klass, object, superObject, name, func) {
    if (typeof func != 'function') return (object[name] = func);
    if (!func.callsSuper()) return (object[name] = func);
    
    var method = function() {
        var _super = superObject[name], args = Array.from(arguments), currentSuper = this._super;
        if (typeof _super == 'function') this._super = function() {
            var i = arguments.length;
            while (i--) args[i] = arguments[i];
            return _super.apply(this, args);
        };
        this._super.valueOf = function() { return _super; };
        this._super.toString = function() { return _super.toString(); };
        var result;
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
};

JS.Class.INSTANCE_METHODS = {
    initialize: function() {},
    
    is_a: function(klass) {
        var _klass = this.klass;
        while (_klass) {
            if (_klass === klass) return true;
            _klass = _klass.superclass;
        }
        return false;
    }
};

JS.Class.CLASS_METHODS = {
    include: function(source, overwrite) {
        if (!source) return;
        var modules, i, n;
        if (source.include) {
            modules = (source.include instanceof Array) ? source.include : [source.include];
            for (i = 0, n = modules.length; i < n; i++)
                this.include(modules[i]);
        }
        if (source.extend) {
            modules = (source.extend instanceof Array) ? source.extend : [source.extend];
            for (i = 0, n = modules.length; i < n; i++)
                this.extend(modules[i]);
        }
        if (source.bindMethods) {
            this.bindMethods = JS.Class.bindMethods;
        }
        for (var method in source) {
            if (!/^(?:include|extend|bindMethods)$/.test(method))
                this.method(method, source[method], overwrite);
        }
        return this;
    },
    
    method: function(name, func, overwrite) {
        if (!this.prototype[name] || overwrite !== false)
            JS.Class.addMethod(this, this.prototype, this.superclass.prototype, name, func);
        return this;
    },
    
    extend: function(source, overwrite) {
        if (!source) return;
        if (typeof source == 'function') source = Function.classProperties(source);
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
};


Function.prototype.bind = function() {
    if (arguments.length < 2 && arguments[0] === undefined) return this;
    var __method = this, args = Array.from(arguments), object = args.shift();
    return function() {
        return __method.apply(object, args.concat(Array.from(arguments)));
    };
};

Function.prototype.callsSuper = function() {
    return /\b_super\b/.test(this.toString());
};

Function.classProperties = function(klass) {
    if (typeof klass != 'function') return {};
    var properties = {}, skip, prop;
    for (var method in klass) {
        skip = false;
        for (prop in JS.Class.ify(function(){}))
            if (method == prop) skip = true;
        if (method == 'bindMethods') skip = true;
        if (skip) continue;
        properties[method] = klass[method];
    }
    return properties;
};

Array.from = function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
};
