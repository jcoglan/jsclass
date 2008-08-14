JS.Compiler = {
  queue: [],
  
  compile: function(klass, options) {
    options = options || {};
    var str = '', i, n;
    this.queue.push(klass);
    while (this.queue.length > 0)
      str += new JS.ClassCompiler(this.queue.shift()).output();
    if (options.subclasses) {
      for (i = 0, n = klass.subclasses.length; i < n; i++)
        str += this.compile(klass.subclasses[i], {subclasses: true});
    }
    return str;
  },
  
  stringify: function(object, superMethod) {
    switch (true) {
      case (object === null):
        return 'null';
      case (object === undefined):
        return 'undefined';
      case (object.isA && object.isA(JS.Class)):
        this.queue.push(object);
        return null;
      case (object instanceof Function):
        return this.stringifyMethod(object, superMethod);
      case (typeof object == 'number' || typeof object == 'boolean'):
        return String(object);
      case (typeof object == 'string'):
        return '"' + object.replace(/"/g, "\\\"").replace(/\n/g, "\\n") + '"';
    }
  },
  
  stringifyMethod: function(method, superMethod) {
    if (!JS.callsSuper(method)) return method.toString();
    
    return 'function() {\n' +
    'var method = ' + method.toString() + ';\n' +
    '    var $super = ' + superMethod + ',\n' +
    '        args = [], i = arguments.length,\n' +
    '        currentSuper = this.callSuper,\n' +
    '        result;\n' +
    '    \n' +
    '    while (i--) args[i] = arguments[i];\n' +
    '    \n' +
    '    this.callSuper = function() {\n' +
    '        var i = arguments.length;\n' +
    '        while (i--) args[i] = arguments[i];\n' +
    '        return $super.apply(this, args);\n' +
    '    };\n' +
    '    \n' +
    '    result = method.apply(this, arguments);\n' +
    '    currentSuper ? this.callSuper = currentSuper : delete this.callSuper;\n' +
    '    return result;\n' +
    '}';
  }
};

JS.ClassCompiler = new JS.Class({
  initialize: function(klass) {
    this._subject = klass;
    this._className = JS.StackTrace.nameOf(klass);
    var superclass = this._subject.superclass;
    this._superclass = (superclass == Object) ? 'Object' : JS.StackTrace.nameOf(superclass);
  },
  
  output: function() {
    return this.declaration() + this.classMethods() + this.instanceMethods();
  },
  
  declaration: function() {
    var str = this._className + ' = ' + this._subject.toString() + ';\n';
    if (this._subject.superclass != Object) str += this.subclass();
    str += this._className + '.prototype.constructor = \n';
    str += this._className + '.prototype.klass = ' + this._className + ';\n';
    str += this._className + '.superclass = ' + this._superclass + ';\n';
    str += this._className + '.subclasses = [];\n';
    if (this._subject.superclass.subclasses instanceof Array)
      str += this._superclass + '.subclasses.push(' + this._className + ');\n';
    return str;
  },
  
  subclass: function() {
    return this._className + '.prototype = (function() {\n' +
    '    var bridge = function() {};\n' +
    '    bridge.prototype = ' + this._superclass + '.prototype;\n' +
    '    return new bridge;\n' +
    '})();\n';
  },
  
  classMethods: function() {
    var anc = this._subject.__eigen__().ancestors(),
        methods = {},
        str = '',
        value, method,
        superMethod;
    
    for (var i = 0, n = anc.length; i < n; i++) {
      if (anc[i] == JS.ObjectMethods || anc[i] == JS.Module || anc[i] == JS.Class) continue;
      JS.extend(methods, anc[i].__mod__.__fns__);
    }
    for (method in methods) {
      if (methods[method] === this._subject.superclass[method]) {
        str += this._className + '.' + method + ' = ' + this._superclass + '.' + method + ';\n';
        continue;
      }
      superMethod = this._superclass + '.' + method;
      value = JS.Compiler.stringify(methods[method], superMethod);
      if (!value) continue;
      str += this._className + '.' + method + ' = ' + value + ';\n';
    }
    return str;
  },
  
  instanceMethods: function() {
    var anc = this._subject.ancestors(), methods = {}, str = '', method, superMethod;
    for (var i = 0, n = anc.length; i < n; i++) {
      if (anc[i] == JS.ObjectMethods) continue;
      JS.extend(methods, anc[i].__mod__.__fns__);
    }
    for (method in methods) {
      if (methods[method] === this._subject.superclass.prototype[method]) continue;
      superMethod = this._superclass + '.prototype.' + method;
      str += this._className + '.prototype.' + method + ' = ' + JS.Compiler.stringify(methods[method], superMethod) + ';\n';
    }
    return str;
  }
});

