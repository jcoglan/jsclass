JS.Ruby = (function() {
  
  var extendDSL = function(builder, source) {
    for (var method in source) {
      if (typeof source[method] == 'function')
        builder[method] = source[method].bind(source);
    }
  };
  
  var ClassBuilder = function(klass) {
    this.def  = klass.method('instanceMethod');
    this.self = {def: klass.method('classMethod')};
    
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
