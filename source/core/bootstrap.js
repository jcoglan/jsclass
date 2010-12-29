(function() {
  var methodsFromPrototype = function(klass) {
    var methods = {},
        proto   = klass.prototype;
    
    for (var field in proto) {
      if (!proto.hasOwnProperty(field)) continue;
      methods[field] = JS.Method.create(klass, field, proto[field]);
    }
    return methods;
  };
  
  var classify = function(name, parentName) {
    var klass  = JS[name],
        parent = JS[parentName];
    
    klass.__inc__ = [];
    klass.__dep__ = [];
    klass.__fns__ = methodsFromPrototype(klass);
    klass.__tgt__ = klass.prototype;
    
    klass.prototype.constructor =
    klass.prototype.klass = klass;
    
    JS.extend(klass, JS.Class.prototype);
    klass.include(parent || JS.Kernel);
    klass.setName(name);
    
    klass.constructor = klass.klass = JS.Class;
  };
  
  classify('Method');
  classify('Module');
  classify('Class', 'Module');
  
  var eigen = JS.Kernel.instanceMethod('__eigen__');
  
  eigen.call(JS.Method);
  eigen.call(JS.Module);
  eigen.call(JS.Class).include(JS.Module.__meta__);
})();

