JS.Set = new JS.Class({
  extend: {
    forEach: function(list, block, context) {
      if (!list) return;
      if (list.forEach) return list.forEach(block, context);
      for (var i = 0, n = list.length; i < n; i++)
        block.call(context || null, list[i], i);
    }
  },
  
  include: JS.Enumerable || {},
  
  initialize: function(list, block, context) {
    this.clear();
    if (block) this.klass.forEach(list, function(item) {
      this.add(block.call(context || null, item));
    }, this);
    else this.merge(list);
  },
  
  forEach: function(block, context) {
    this.klass.forEach(this._members, block, context);
  },
  
  add: function(item) {
    if (this.contains(item)) return;
    this._members.push(item);
  },
  
  classify: function(block, context) {
    var classes = {}, i = this._members.length, value;
    while (i--) {
      value = block.call(context || null, this._members[i]);
      if (!classes[value]) classes[value] = new this.klass;
      classes[value].add(this._members[i]);
    }
    return classes;
  },
  
  clear: function() {
    this._members = [];
  },
  
  contains: function(item) {
    return this._indexOf(item) != -1;
  },
  
  intersection: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (this.contains(item)) set.add(item);
    }, this);
    return set;
  },
  
  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },
  
  size: function() {
    return this._members.length;
  },
  
  union: function(other) {
    var set = new this.klass;
    set.merge(this);
    set.merge(other);
    return set;
  },
  
  _indexOf: function(item) {
    return this._members.indexOf(item);
  }
});

JS.Set.include({
  n:  JS.Set.instanceMethod('intersection'),
  u:  JS.Set.instanceMethod('union')
});

JS.SortedSet = new JS.Class(JS.Set, {
  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return;
    this._members.splice(point, 0, item);
  },
  
  sort: function() {
    var members = this._members;
    this.clear();
    this.merge(members);
  },
  
  _indexOf: function(item, insertionPoint) {
    var items = this._members, n = items.length, i = 0, d = n;
    if (n == 0) return insertionPoint ? 0 : -1;
    var compare = JS.isFn(item.compareTo);
    
    if ( compare
        ? (item.compareTo(items[0]) < 1)
        : (item <= items[0]) )
        { d = 0; i = 0; }
    
    if ( compare
        ? (item.compareTo(items[n-1]) > -1)
        : (item >= items[n-1]) )
        { d = 0; i = n; }
    
    while (items[i] !== item && d > 0.5) {
      d = d / 2;
      i += ( (compare
              ? (item.compareTo(items[i]) > 0)
              : (item > items[i]))
          ? 1 : -1 )
          * Math.round(d);
      
      if (i > 0
          && ( compare
              ? (item.compareTo(items[i-1]) > 0)
              : (item > items[i-1]) )
          && ( compare
              ? (item.compareTo(items[i]) < 1)
              : (item <= items[i]) )
      ) d = 0;
    }
    
    var found = (items[i] === item);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  }
});

JS.Enumerable.include({
  toSet: function(klass, block, context) {
    klass = klass || JS.Set;
    return new klass(this, block, context);
  }
});
