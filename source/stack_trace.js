JS.StackTrace = new JS.Module({
  extend: {
    included: function(base) {
      var module = base.__mod__ || base, self = this;
      
      module.extend({define: function(name, func) {
        if (!JS.isFn(func)) return this.callSuper();
        var wrapper = function() {
          var fullName = module.__name__ + '#' + name;
          self.stack.push(fullName, arguments);
          var result = func.apply(this, arguments);
          self.stack.pop(result);
          return result;
        };
        wrapper.toString = function() { return func.toString() };
        return this.callSuper(name, wrapper);
      } });
      
      if (!module.__name__) setTimeout(function() {
        module.__name__ = self.nameOf(base);
      }, 100);
    },
    
    nameOf: function(object, root) {
      if (object.__name__) return object.__name__;
      var field = [{name: null, o: root || this.root}], l = 0;
      while (typeof field == 'object' && l < this.maxDepth) {
        l += 1;
        field = this.descend(field, object);
      }
      object.__name__ = (typeof field == 'string')
          ? field.replace(/\.prototype\./g, '#')
          : undefined;
      return object.__name__;
    },
    
    descend: function(list, needle) {
      var results = [], n = list.length, i = n, key, item, name;
      while (i--) {
        item = list[i];
        if (n > 1 && this.excluded.indexOf(item.o) != -1) continue;
        if (item.o instanceof Array) continue;
        name = item.name ? item.name + '.' : '';
        for (key in item.o) {
          if (needle && item.o[key] === needle) return name + key;
          results.push({name: name + key, o: item.o[key]});
        }
      }
      return results;
    },
    
    root: this,
    excluded: [],
    maxDepth: 8,
    
    stack: new JS.Singleton({
      __list__: [],
      
      indent: function() {
        var indent = '', n = this.__list__.length;
        while (n--) indent += '|  ';
        return indent;
      },
      
      push: function(name, args) {
        window.console && console.log(this.indent() + name + '(', args, ')');
        this.__list__.push(name);
      },
      
      pop: function(result) {
        var name = this.__list__.pop();
        window.console && console.log(this.indent() + name + '() --> ', result);
        return name;
      }
    })
  }
});

(function() {
  var module = JS.StackTrace;
  for (var key in module.root) {
    if (key != 'JS') module.excluded.push(module.root[key]);
  }
})();
