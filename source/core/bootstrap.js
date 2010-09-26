(function(bootstrap) {
  bootstrap('Method');
  bootstrap('Module');
  bootstrap('Class', 'Module');
  
})(function(name, parentName) {
  var klass  = JS[name],
      parent = JS[parentName],
      proto  = klass.prototype;
  
  klass.__inc__ = [];
  klass.__dep__ = [];
  klass.__fns__ = proto;
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
});

