JS.Compiler = {
  queue: [],
  
  compile: function(klass) {
    var str = '';
    this.queue.push(klass);
    while (this.queue.length > 0)
      str += new JS.ClassCompiler(this.queue.shift()).output();
    return str;
  },
  
  stringify: function(object, compiler, method) {
    switch (true) {
      case (object === null):
        return 'null';
      case (object === undefined):
        return 'undefined';
      case (object.isA && object.isA(JS.Class)):
        this.queue.push(object);
        return null;
      case (object instanceof Function):
        return this.stringifyMethod(object, compiler, method);
      case (typeof object == 'number' || typeof object == 'boolean'):
        return String(object);
      case (typeof object == 'string'):
        return '"' + object.replace(/"/g, "\\\"").replace(/\n/g, "\\n") + '"';
    }
  },
  
  stringifyMethod: function(method, compiler, name) {
    if (!JS.callsSuper(method)) return method.toString();
    
    return 'function() {\n' +
    'var method = ' + method.toString() + ';\n' +
    '   var $super = ' + JS.StackTrace.nameOf(compiler._subject.superclass) + '.prototype.' + name + ';\n' +
    '   return method.apply(this, arguments);\n' +
    '}';
  }
};

JS.ClassCompiler = new JS.Class({
  initialize: function(klass) {
    this._subject = klass;
    this._className = JS.StackTrace.nameOf(klass);
  },
  
  output: function() {
    return this.declaration() + this.classMethods() + this.instanceMethods();
  },
  
  declaration: function() {
    var str = this._className + ' = ' + this._subject.toString() + ';\n';
    if (this._subject.superclass != Object) str += this.subclass();
    str += this._className + '.prototype.constructor = \n';
    str += this._className + '.prototype.klass = ' + this._className + ';\n';
    var superclass = this._subject.superclass;
    superclass = (superclass == Object) ? 'Object' : JS.StackTrace.nameOf(superclass);
    str += this._className + '.superclass = ' + superclass + ';\n';
    str += this._className + '.subclasses = [];\n';
    if (this._subject.superclass.subclasses instanceof Array)
      str += superclass + '.subclasses.push(' + this._className + ');\n';
    return str;
  },
  
  subclass: function() {
    var superclass = JS.StackTrace.nameOf(this._subject.superclass);
    return this._className + '.prototype = (function() {\n' +
    '    var bridge = function() {};\n' +
    '    bridge.prototype = ' + superclass + '.prototype;\n' +
    '    return new bridge;\n' +
    '})();\n';
  },
  
  classMethods: function() {
    var anc = this._subject.__eigen__().ancestors(),
        methods = {},
        str = '',
        value, method;
    
    for (var i = 0, n = anc.length; i < n; i++) {
      if (anc[i] == JS.ObjectMethods || anc[i] == JS.Module || anc[i] == JS.Class) continue;
      JS.extend(methods, anc[i].__mod__.__fns__);
    }
    for (method in methods) {
      value  = JS.Compiler.stringify(methods[method]);
      if (!value) continue;
      str += this._className + '.' + method + ' = ' + value + ';\n';
    }
    return str;
  },
  
  instanceMethods: function() {
    var anc = this._subject.ancestors(), methods = {}, str = '', method;
    for (var i = 0, n = anc.length; i < n; i++) {
      if (anc[i] == JS.ObjectMethods) continue;
      JS.extend(methods, anc[i].__mod__.__fns__);
    }
    for (method in methods) {
      if (methods[method] == this._subject.superclass.prototype[method]) continue;
      str += this._className + '.prototype.' + method + ' = ' + JS.Compiler.stringify(methods[method], this, method) + ';\n';
    }
    return str;
  }
});

