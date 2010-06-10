JS.Ruby = function(klass, define) {
  JS.Ruby.selfless(define).call(new JS.Ruby.ClassBuilder(klass));
};

JS.extend(JS.Ruby, {
  selfless: function(block) {
    if (!JS.isFn(block)) return block;
    
    var source = block.toString(),
        args   = source.match(/^[^\(]*\(([^\(]*)\)/)[1].split(/\s*,\s*/),
        body   = source.match(/^[^\{]*{((.*\n*)*)}/m)[1];
    
    body = 'with(this) { ' + body + ' }';
    
    if (args.length === 3)
      return new Function(args[0], args[1], args[2], body);
    else if (args.length === 2)
      return new Function(args[0], args[1], body);
    else if (args.length === 1)
      return new Function(args[0], body);
    else if (args.length === 0)
      return new Function(body);
  },
  
  extendDSL: function(builder, source) {
    for (var method in source) {
      if (builder[method] || !JS.isFn(source[method])) continue;
      this.addMethod(builder, source, method);
    }
  },
  
  addMethod: function(builder, source, method) {
    if (source[method].klass) return builder[method] = source[method];
    
    builder[method] = function() {
      var result = source[method].apply(source, arguments);
      JS.Ruby.extendDSL(builder, source);
      return result;
    };
  },
  
  alias: function(object, builder) {
    return function(newName, oldName) {
      var old = object[oldName];
      if (old !== undefined) this.define(newName, old);
      if (builder) JS.Ruby.extendDSL(builder, object);
    };
  },
  
  ClassBuilder: function(klass) {
    this.define = klass.method('define');
    this.alias  = JS.Ruby.alias(klass.prototype);
    
    this.self = {
      define: JS.bind(function(name, method) {
        var def = {}; def[name] = method;
        klass.extend(def);
        JS.Ruby.extendDSL(this, klass);
      }, this),
      alias: JS.Ruby.alias(klass, this)
    };
    
    JS.Ruby.extendDSL(this, klass);
  }
});
