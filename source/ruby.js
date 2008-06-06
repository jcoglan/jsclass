JS.Ruby = function(klass, define) {
  define.call(new JS.Ruby.ClassBuilder(klass));
};

JS.extend(JS.Ruby, {
  extendDSL: function(builder, source) {
    for (var method in source) {
      if (builder[method] || !JS.isFn(source[method])) continue;
      this.addMethod(builder, source, method);
    }
  },
  
  addMethod: function(builder, source, method) {
    builder[method] = function() {
      var result = source[method].apply(source, arguments);
      JS.Ruby.extendDSL(builder, source);
      return result;
    };
  },
  
  alias: function(object, builder) {
    return function(newName, oldName) {
      var old = object[oldName];
      if (old !== undefined) this.def(newName, old);
      if (builder) JS.Ruby.extendDSL(builder, object);
    };
  },
  
  ClassBuilder: function(klass) {
    this.def    = klass.method('define');
    this.alias  = JS.Ruby.alias(klass.prototype);
    
    this.self = {
      def: JS.bind(function(name, method) {
        var def = {}; def[name] = method;
        klass.extend(def);
        JS.Ruby.extendDSL(this, klass);
      }, this),
      alias: JS.Ruby.alias(klass, this)
    };
    
    this.extend = function(source) {
      klass.extend(source);
      JS.Ruby.extendDSL(this, klass);
    };
    
    this.instanceMethod = function(name) {
      var method = klass.lookup(name).pop();
      return (JS.isFn(method)) ? method : null;
    };
    
    JS.Ruby.extendDSL(this, klass);
  }
});
