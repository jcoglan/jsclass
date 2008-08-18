JS.Compiler = new JS.Class({
  extend: {
    reset: function() {
      this._queue = [];
      this._processed = [];
    },
    
    compile: function(klass, options) {
      var str = '';
      this._queue.push(klass);
      while (this._queue.length > 0)
        str += new this(this._queue.shift()).output(options || {});
      return str;
    },
    
    nameOf: function(object) {
      return JS.StackTrace.nameOf(object);
    },
    
    stringify: function(object) {
      switch (true) {
        case (object === null):
          return 'null';
        case (object === undefined):
          return 'undefined';
        case (object.isA && object.isA(JS.Class)):
          this.queue.push(object);
          return null;
        case (object instanceof Function):
          return object.toString().replace(/^\s*/g, '').replace(/\s*$/g, '');
        case (typeof object == 'number' || typeof object == 'boolean'):
          return String(object);
        case (typeof object == 'string'):
          return '"' + object.replace(/"/g, "\\\"").replace(/\n/g, "\\n") + '"';
      }
    }
  },
  
  initialize: function(classOrModule) {
    if (!classOrModule.isA) return this;
    if (classOrModule.isA(JS.Class)) return new JS.ClassCompiler(classOrModule);
    if (classOrModule.isA(JS.Module)) return new JS.ModuleCompiler(classOrModule);
  },
  
  output: function() {
    return '/* Could not be compiled -- not a class or module */\n';
  }
});

JS.Compiler.reset();

JS.Compiler.extend({superCaller: JS.Compiler.stringify(function() {
  var self = arguments.callee, anc = self.__anc__, nym = self.__nym__,
      methods = [], i = arguments.length, n, found, params = [];
  
  while (i--) params.push(arguments[i]);
  
  for (i = 0, n = anc.length; i < n; i++) {
    if (found = anc[i].__fns__[nym]) methods.push(found);
  }
  var stackIndex = methods.length,
      currentSuper = this.callSuper,
      that = this, result;
  
  this.callSuper = function() {
    var i = arguments.length;
    while (i--) params[i] = arguments[i];
    stackIndex -= 1;
    var returnValue = methods[stackIndex].apply(that, params);
    stackIndex += 1;
    return returnValue;
  };
  
  result = this.callSuper();
  currentSuper ? this.callSuper = currentSuper : delete this.callSuper;
  return result;
}) });

JS.ModuleCompiler = new JS.Class(JS.Compiler, {
  initialize: function(module) {
    this._module = module;
    this._name = this.klass.nameOf(module);
  },
  
  output: function() {
    return this.declaration() + this.singletonMethods();
  },
  
  declaration: function() {
    return  this._name + ' = {__fns__: {}, __meta__: {__fns__: {}}};\n';
  },
  
  singletonMethods: function() {
    var ancestors = this._module.__eigen__().ancestors().slice(2), self = ancestors.pop(),
        i, n, name, block, method, str = '', assign;
    
    block = self.__fns__;
    
    for (method in block) {
      assign = this._name + '.' + method;
      if (!JS.callsSuper(block[method])) {
        str += assign + ' = ' + this.klass.stringify(block[method]) + ';\n';
      } else {
        str += this._name + '.__meta__.__fns__.' + method + ' = ' + this.klass.stringify(block[method]) + ';\n';
        str += assign + ' = ' + this.klass.superCaller + ';\n';
        str += assign + '.__anc__ = [' + this.klass.nameOf(ancestors).join(', ') + ', ' + this._name + '.__meta__];\n';
        str += assign + '.__nym__ = ' + this.klass.stringify(method) + ';\n';
      }
    }
    
    for (i = 0, n = ancestors.length; i < n; i++) {
      if (ancestors[i] == JS.ObjectMethods || ancestors[i] == JS.Module) continue;
      name = this.klass.nameOf(ancestors[i]);
      console.log(name);
      block = ancestors[i].__fns__;
      for (method in block) {
        if (this._module[method] === block[method])
          str += this._name + '.' + method + ' = ' + name + '.__fns__.' + method + ';\n';
      }
    }
    return str;
  }
});

