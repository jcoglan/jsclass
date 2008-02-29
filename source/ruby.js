JS.RubyClass = (function() {
  
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
  
  return function(parent, definition) {
    definition = arguments[arguments.length - 1];
    if (definition == parent) parent = null;
    
    var klass = JS.Class(parent || {});
    definition(new ClassBuilder(klass));
    return klass;
  };
})();
