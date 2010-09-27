(function() {
  var methodsFromPrototype = function(module, prototype) {
    var methods = {};
    for (var field in prototype) {
      if (!proto.hasOwnProperty(field)) continue;
      methods[field] = JS.Method.create(module, field, prototype[field]);
    }
    return methods;
  };
  
  var bootstrap = function(name, parentName) {
    var klass  = JS[name],
        parent = JS[parentName],
        proto  = klass.prototype;
    
    klass.__inc__ = [];
    klass.__dep__ = [];
    klass.__fns__ = methodsFromPrototype(proto);
    klass.__tgt__ = proto;
    
    JS.Kernel.instanceMethod('__eigen__').call(klass);
    JS.extend(klass, JS.Class.prototype);
    
    if (parent) {
      klass.__inc__.push(parent);
      parent.__dep__.push(klass);
    }
    else {
      klass.include(JS.Kernel);
    }
  };
  
  bootstrap('Method');
  bootstrap('Module');
  bootstrap('Class', 'Module');
})();

