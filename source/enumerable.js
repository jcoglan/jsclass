JS.Enumerable = new JS.Module('Enumerable', {
  extend: {
    forEach: function(block, context) {
      for (var i = 0, n = this.length; i < n; i++) {
        if (this[i] !== undefined)
          block.call(context || null, this[i], i);
      }
    },
    
    isComparable: function(list) {
      return list.all(function(item) {
        return JS.isFn(item.compareTo);
      });
    },
    
    match: function(pattern, object) {
      if (JS.isFn(pattern.match)) return pattern.match(object);
      
      if (JS.isType(pattern, JS.Module))
        return JS.isType(object, pattern);
      
      if (JS.isFn(pattern)) return pattern(object);
      
      return null;
    },
    
    Collection: new JS.Class({
      initialize: function(array) {
        this.length = 0;
        var push = Array.prototype.push;
        JS.Enumerable.forEach.call(array, function(item) {
          push.call(this, item);
        }, this);
      }
    })
  },
  
  all: function(block, context) {
    var truth = true;
    this.forEach(function() {
      truth = truth && block.apply(context || null, arguments);
    });
    return !!truth;
  },
  
  any: function(block, context) {
    var truth = false;
    this.forEach(function() {
      truth = truth || block.apply(context || null, arguments);
    });
    return !!truth;
  },
  
  count: function(block, context) {
    if (JS.isFn(this.size)) return this.size();
    var count = 0, object = block;
    
    if (object && !JS.isFn(object))
      block = function(x) { return x === object };
    
    this.forEach(function() {
      if (!block || block.apply(context || null, arguments))
        count += 1;
    });
    return count;
  },
  
  cycle: function(n, block, context) {
    while (n--) this.forEach(block, context);
  },
  
  drop: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i >= n) entries.push(item);
    });
    return entries;
  },
  
  dropWhile: function(block, context) {
    var entries = [],
        drop    = true;
    this.forEach(function(item) {
      if (drop) drop = drop && block.apply(context || null, arguments);
      if (!drop) entries.push(item);
    });
    return entries;
  },
  
  forEachCons: function(n, block, context) {
    var entries = this.entries(),
        size    = entries.length,
        limit   = size - n,
        i;
    
    for (i = 0; i <= limit; i++)
      block.call(context || null, entries.slice(i, i+n), i);
  },
  
  forEachSlice: function(n, block, context) {
    var entries = this.entries(),
        size    = entries.length,
        m       = Math.ceil(size/n),
        i;
    
    for (i = 0; i < m; i++)
      block.call(context || null, entries.slice(i*n, (i+1)*n), i);
  },
  
  forEachWithIndex: function(block, context) {
    var index = 0;
    this.forEach(function(item) {
      block.call(context || null, item, index);
      index += 1;
    });
  },
  
  forEachWithObject: function(object, block, context) {
    this.forEach(function() {
      var args = JS.array(arguments);
      args.push(object);
      block.apply(context || null, args);
    });
    return object;
  },
  
  find: function(block, context) {
    var needle = {}, K = needle;
    this.forEach(function(item) {
      if (needle !== K) return;
      needle = block.apply(context || null, arguments) ? item : needle;
    });
    return needle === K ? null : needle;
  },
  
  findIndex: function(needle, context) {
    var index = null,
        block = JS.isFn(needle);
    
    this.forEachWithIndex(function(item, i) {
      if (index !== null) return;
      if (needle === item || (block && needle.apply(context || null, arguments)))
        index = i;
    });
    return index;
  },
  
  first: function(n) {
    var entries = this.entries();
    return (n === undefined) ? entries[0] : entries.slice(0,n);
  },
  
  grep: function(pattern, block, context) {
    var results = [];
    this.forEach(function(item) {
      if (!JS.Enumerable.match(pattern, item)) return;
      if (block) item = block.apply(context || null, arguments);
      results.push(item);
    });
    return results;
  },
  
  groupBy: function(block, context) {
    var hash = new JS.Hash();
    this.forEach(function(item) {
      var value = block.apply(context || null, arguments);
      if (!hash.hasKey(value)) hash.store(value, []);
      hash.get(value).push(item);
    });
    return hash;
  },
  
  inject: function(memo, block, context) {
    var counter = 0, K = {};
    if (JS.isFn(memo)) {
      context = block; block = memo; memo = K;
    }
    this.forEach(function(item) {
      if (!counter++ && memo === K) return memo = item;
      var args = [memo].concat(JS.array(arguments));
      memo = block.apply(context || null, args);
    });
    return memo;
  },
  
  map: function(block, context) {
    var map = [];
    this.forEach(function() {
      map.push(block.apply(context || null, arguments));
    });
    return map;
  },
  
  max: function(block, context) {
    return this.minmax(block, context)[1];
  },
  
  maxBy: function(block, context) {
    return this.minmaxBy(block, context)[1];
  },
  
  member: function(needle) {
    return this.any(function(item) { return item === needle; });
  },
  
  min: function(block, context) {
    return this.minmax(block, context)[0];
  },
  
  minBy: function(block, context) {
    return this.minmaxBy(block, context)[0];
  },
  
  minmax: function(block, context) {
    var list = this.sort(block, context);
    return [list[0], list[list.length - 1]];
  },
  
  minmaxBy: function(block, context) {
    var list = this.sortBy(block, context);
    return [list[0], list[list.length - 1]];
  },
  
  none: function(block, context) {
    return !this.any(block, context);
  },
  
  one: function(block, context) {
    return this.count(block, context) === 1;
  },
  
  partition: function(block, context) {
    var ayes = [], noes = [];
    this.forEach(function(item) {
      (block.apply(context || null, arguments) ? ayes : noes).push(item);
    });
    return [ayes, noes];
  },
  
  reject: function(block, context) {
    var map = [];
    this.forEach(function(item) {
      if (!block.apply(context || null, arguments)) map.push(item);
    });
    return map;
  },
  
  reverseForEach: function(block, context) {
    var enrties = this.entries(), n = entries.length;
    while (n--) block.call(context || null, entries[n], n);
  },
  
  select: function(block, context) {
    var map = [];
    this.forEach(function(item) {
      if (block.apply(context || null, arguments)) map.push(item);
    });
    return map;
  },
  
  sort: function(block, context) {
    var comparable = JS.Enumerable.isComparable(this),
        entries    = this.entries();
    
    block = block || (comparable
        ? function(a,b) { return a.compareTo(b); }
        : null);
    return block
        ? entries.sort(function(a,b) { return block.call(context || null, a, b); })
        : entries.sort();
  },
  
  sortBy: function(block, context) {
    var util       = JS.Enumerable,
        map        = new util.Collection(this.map(block, context)),
        comparable = util.isComparable(map);
    
    return new util.Collection(map.zip(this).sort(function(a, b) {
      a = a[0]; b = b[0];
      return comparable ? a.compareTo(b) : (a < b ? -1 : (a > b ? 1 : 0));
    })).map(function(item) { return item[1]; });
  },
  
  take: function(n) {
    var entries = [];
    this.forEachWithIndex(function(item, i) {
      if (i < n) entries.push(item);
    });
    return entries;
  },
  
  takeWhile: function(block, context) {
    var entries = [],
        take    = true;
    this.forEach(function(item) {
      if (take) take = take && block.apply(context || null, arguments);
      if (take) entries.push(item);
    });
    return entries;
  },
  
  toArray: function() {
    return this.drop(0);
  },
  
  zip: function() {
    var util    = JS.Enumerable,
        args    = [],
        counter = 0,
        n       = arguments.length,
        block, context;
    
    if (JS.isFn(arguments[n-1])) {
      block = arguments[n-1]; context = {};
    }
    if (JS.isFn(arguments[n-2])) {
      block = arguments[n-2]; context = arguments[n-1];
    }
    util.forEach.call(arguments, function(arg) {
      if (arg === block || arg === context) return;
      if (arg.toArray) arg = arg.toArray();
      if (JS.isType(arg, Array)) args.push(arg);
    });
    var results = this.map(function(item) {
      var zip = [item];
      util.forEach.call(args, function(arg) {
        zip.push(arg[counter] === undefined ? null : arg[counter]);
      });
      return ++counter && zip;
    });
    if (!block) return results;
    util.forEach.call(results, block, context);
  }
});
  
// http://developer.mozilla.org/en/docs/index.php?title=Core_JavaScript_1.5_Reference:Global_Objects:Array&oldid=58326
JS.Enumerable.include({
  forEach:    JS.Enumerable.forEach,
  collect:    JS.Enumerable.instanceMethod('map'),
  detect:     JS.Enumerable.instanceMethod('find'),
  entries:    JS.Enumerable.instanceMethod('toArray'),
  every:      JS.Enumerable.instanceMethod('all'),
  findAll:    JS.Enumerable.instanceMethod('select'),
  filter:     JS.Enumerable.instanceMethod('select'),
  some:       JS.Enumerable.instanceMethod('any')
}, false);

JS.Enumerable.Collection.include(JS.Enumerable, true);

