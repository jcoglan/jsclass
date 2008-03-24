JS.Ruby = function(klass, define) {
  define.call(new JS.Ruby.ClassBuilder(klass));
};

JS.extend(JS.Ruby, {
  extendDSL: function(builder, source) {
    for (var method in source) {
      if (!builder[method] && typeof Function.is(source[method]))
        (function(methodName) {
          builder[methodName] = function() {
            var result = source[methodName].apply(source, arguments);
            JS.Ruby.extendDSL(builder, source);
            return result;
          };
        })(method);
    }
  },
  
  alias: function(object, builder) {
    return function(newName, oldName) {
      var old = object[oldName];
      if (old !== undefined) this.def(newName, old);
      if (builder) JS.Ruby.extendDSL(builder, object);
    };
  },
  
  ClassBuilder: function(klass) {
    this.def    = klass.method('instanceMethod');
    this.alias  = JS.Ruby.alias(klass.prototype);
    
    this.self = {
      def: function(name, method) {
        klass.classMethod(name, method);
        JS.Ruby.extendDSL(this, klass);
      }.bind(this),
      alias: JS.Ruby.alias(klass, this)
    };
    
    this.extend = function(source) {
      klass.extend(source);
      JS.Ruby.extendDSL(this, klass);
    };
    
    this.instanceMethod = function(name) {
      var method = klass.prototype[name];
      return (Function.is(method)) ? method : null;
    };
    
    JS.Ruby.extendDSL(this, klass);
  }
});
