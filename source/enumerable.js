JS.Enumerable = (function() {
  
  var Null = function(context) { return context || null; };
  
  var each = function(block, context) {
    for (var i = 0, n = this.length; i < n; i++)
      block.call(Null(context), this[i], i);
  };
  
  var isComparable = function(list) {
    return list.all(function(item) {
      return typeof item.compareWith == 'function';
    });
  };
  
  var Collection = JS.Class({
    initialize: function(array) {
      this.length = 0;
      each.call(array, function(item) {
        [].push.call(this, item);
      }, this);
    }
  });
  
  var methods = {
    all: function(block, context) {
      var truth = true;
      this.each(function(item, i) {
        truth = truth && block.call(Null(context), item, i);
      });
      return !!truth;
    },
    
    any: function(block, context) {
      var truth = false;
      this.each(function(item, i) {
        truth = truth || block.call(Null(context), item, i);
      });
      return !!truth;
    },
    
    eachCons: function(n, block, context) {
      var entries = this.entries(), size = entries.length, limit = size - n;
      for (var i = 0; i <= limit; i++)
        block.call(Null(context), entries.slice(i, i+n), i);
    },
    
    eachSlice: function(n, block, context) {
      var entries = this.entries(), size = entries.length, m = Math.ceil(size/n);
      for (var i = 0; i < m; i++)
        block.call(Null(context), entries.slice(i*n, (i+1)*n), i);
    },
    
    find: function(block, context) {
      var needle = {}, K = needle;
      this.each(function(item, i) {
        if (needle != K) return;
        needle = block.call(Null(context), item, i) ? item : needle;
      });
      return needle == K ? null : needle;
    },
    
    inject: function(memo, block, context) {
      var counter = 0, K = {};
      if (typeof memo == 'function') {
        context = block; block = memo; memo = K;
      }
      this.each(function(item, i) {
        if (!counter++ && memo === K) return memo = item;
        memo = block.call(Null(context), memo, item, i);
      });
      return memo;
    },
    
    map: function(block, context) {
      var map = [];
      this.each(function(item, i) {
        map.push(block.call(Null(context), item, i));
      });
      return map;
    },
    
    max: function(block, context) {
      var list = this.sort(block, context);
      return list[list.length - 1];
    },
    
    member: function(needle) {
      return this.any(function(item) { return item == needle; });
    },
    
    min: function(block, context) {
      var list = this.sort(block, context);
      return list[0];
    },
    
    partition: function(block, context) {
      var ayes = [], noes = [];
      this.each(function(item, i) {
        (block.call(Null(context), item, i) ? ayes : noes).push(item);
      });
      return [ayes, noes];
    },
    
    reject: function(block, context) {
      var map = [];
      this.each(function(item, i) {
        if (!block.call(Null(context), item, i)) map.push(item);
      });
      return map;
    },
    
    select: function(block, context) {
      var map = [];
      this.each(function(item, i) {
        if (block.call(Null(context), item, i)) map.push(item);
      });
      return map;
    },
    
    sort: function(block, context) {
      var comparable = isComparable(this), entries = this.entries();
      block = block || (comparable
          ? function(a,b) { return a.compareWith(b); }
          : null);
      return block
          ? entries.sort(function(a,b) { return block.call(Null(context), a, b); })
          : entries.sort();
    },
    
    sortBy: function(block, context) {
      var map = new Collection(this.map(block, context));
      var comparable = isComparable(map);
      return new Collection(map.zip(this).sort(function(a, b) {
        a = a[0]; b = b[0];
        return comparable ? a.compareWith(b) : (a < b ? -1 : (a > b ? 1 : 0));
      })).map(function(item) { return item[1]; });
    },
    
    toArray: function() {
      return this.map(function(x) { return x; });
    },
    
    zip: function() {
      var args = [], counter = 0, n = arguments.length, block, context;
      if (arguments[n-1] instanceof Function) {
        block = arguments[n-1]; context = {};
      }
      if (arguments[n-2] instanceof Function) {
        block = arguments[n-2]; context = arguments[n-1];
      }
      each.call(arguments, function(arg) {
        if (arg == block || arg == context) return;
        if (arg.toArray) arg = arg.toArray();
        if (arg instanceof Array) args.push(arg);
      });
      var results = this.map(function(item) {
        var zip = [item];
        each.call(args, function(arg) {
          zip.push(arg[counter] === undefined ? null : arg[counter]);
        });
        return ++counter && zip;
      });
      if (!block) return results;
      each.call(results, block, context);
    }
  };
  
  var alias = {
    find:       'detect',
    map:        'collect',
    select:     'findAll',
    toArray:    'entries'
  };
  
  for (var key in alias) methods[alias[key]] = methods[key];
  
  var module = {
    included: function(klass) {
      if (!klass.prototype.each) klass.include({each: each});
      klass.include(methods);
    }
  };
  
  Collection.include(module);
  return module;
})();
