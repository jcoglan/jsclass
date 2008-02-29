JS.Ruby = (function() {
  
  var extendDSL = function(builder, source) {
    for (var method in source) {
      if (!builder[method] && typeof source[method] == 'function')
        builder[method] = source[method].bind(source);
    }
  };
  
  var alias = function(object) {
    return function(newName, oldName) {
      var old = object[oldName];
      if (old !== undefined) this.def(newName, old);
    };
  };
  
  var ClassBuilder = function(klass) {
    this.def    = klass.method('instanceMethod');
    this.alias  = alias(klass.prototype);
    
    this.self = {
      def: function(name, method) {
        klass.classMethod(name, method);
        extendDSL(klass);
      },
      alias: alias(klass)
    };
    
    extendDSL(this, klass);
    
    this.extend = function(source) {
      klass.extend(source);
      extendDSL(this, klass);
    };
  };
  
  return function(klass, define) {
    define(new ClassBuilder(klass));
  };
})();
