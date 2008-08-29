JS.Set = new JS.Class({
  extend: {
    forEach: function(list, block, context) {
      if (!list) return;
      if (list.forEach) return list.forEach(block, context);
      for (var i = 0, n = list.length; i < n; i++)
        block.call(context || null, list[i], i);
    },
    
    areEqual: function(one, another) {
      return one.equals
          ? one.equals(another)
          : (one === another);
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
    if (this.contains(item)) return false;
    this._members.push(item);
    this.length = this.size = this._members.length;
    return true;
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
    this.length = this.size = this._members.length;
  },
  
  complement: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (!this.contains(item)) set.add(item);
    }, this);
    return set;
  },
  
  contains: function(item) {
    return this._indexOf(item) !== -1;
  },
  
  difference: function(other) {
    other = (other instanceof JS.Set) ? other : new JS.Set(other);
    var set = new this.klass, items = this._members, i = items.length;
    while (i--) {
      if (!other.contains(items[i])) set.add(items[i]);
    }
    return set;
  },
  
  divide: function(block, context) {
    var classes = this.classify(block, context), sets = new this.klass;
    for (var key in classes) sets.add(classes[key]);
    return sets;
  },
  
  equals: function(other) {
    if (this.length !== other.length || !(other instanceof JS.Set)) return false;
    var i = this._members.length;
    while (i--) {
      if (!other.contains(this._members[i])) return false;
    }
    return true;
  },
  
  flatten: function(set) {
    var members = this._members, item, i = members.length;
    if (!set) { this.clear(); set = this; }
    while (i--) {
      item = members[i];
      if (item instanceof JS.Set) item.flatten(set);
      else set.add(item);
    }
    return set;
  },
  
  intersection: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (this.contains(item)) set.add(item);
    }, this);
    return set;
  },
  
  isEmpty: function() {
    return this._members.length === 0;
  },
  
  isProperSubset: function(other) {
    return this._members.length < other._members.length && this.isSubset(other);
  },
  
  isProperSuperset: function() {
    return this._members.length > other._members.length && this.isSuperset(other);
  },
  
  isSubset: function(other) {
    var members = this._members, i = members.length;
    while (i--) {
      if (!other.contains(members[i])) return false;
    }
    return true;
  },
  
  isSuperset: function(other) {
    return other.isSubset(this);
  },
  
  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },
  
  product: function(other) {
    var pairs = new JS.Set;
    this.forEach(function(item) {
      this.klass.forEach(other, function(partner) {
        pairs.add([item, partner]);
      });
    }, this);
    return pairs;
  },
  
  rebuild: function() {
    var members = this._members;
    this.clear();
    this.merge(members);
  },
  
  remove: function(item) {
    var index = this._indexOf(item);
    if (index === -1) return;
    this._members.splice(index, 1);
    this.length = this.size = this._members.length;
  },
  
  removeIf: function(predicate, context) {
    var members = this._members, i = members.length;
    while (i--) {
      if (predicate.call(context || null, members[i]))
        this.remove(members[i]);
    }
  },
  
  replace: function(other) {
    this.clear();
    this.merge(other);
  },
  
  subtract: function(list) {
    this.klass.forEach(list, function(item) {
      this.remove(item);
    }, this)
  },
  
  union: function(other) {
    var set = new this.klass;
    set.merge(this);
    set.merge(other);
    return set;
  },
  
  xor: function(other) {
    var set = new JS.Set(other);
    var members = this._members, i = members.length, item;
    while (i--) {
      item = members[i];
      set[set.contains(item) ? 'remove' : 'add'](item);
    }
    return set;
  },
  
  _indexOf: function(item) {
    var i = this._members.length, equal = this.klass.areEqual;
    while (i--) {
      if (equal(item, this._members[i])) return i;
    }
    return -1;
  }
});

JS.Set.include({
  n:  JS.Set.instanceMethod('intersection'),
  u:  JS.Set.instanceMethod('union'),
  x:  JS.Set.instanceMethod('product')
});

JS.SortedSet = new JS.Class(JS.Set, {
  extend: {
    compare: function(one, another) {
      return one.compareTo
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    }
  },
  
  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return;
    this._members.splice(point, 0, item);
    this.length = this.size = this._members.length;
  },
  
  _indexOf: function(item, insertionPoint) {
    var items = this._members, n = items.length, i = 0, d = n;
    if (n === 0) return insertionPoint ? 0 : -1;
    var compare = this.klass.compare, equal = this.klass.areEqual;
    
    if (compare(item, items[0]) < 1)   { d = 0; i = 0; }
    if (compare(item, items[n-1]) > 0) { d = 0; i = n; }
    
    while (!equal(item, items[i]) && d > 0.5) {
      d = d / 2;
      i += (compare(item, items[i]) > 0 ? 1 : -1) * Math.round(d);
      if (i > 0 && compare(item, items[i-1]) > 0 && compare(item, items[i]) < 1) d = 0;
    }
    
    // The pointer will end up at the start of any homogenous section. Step
    // through the section until we find the needle or until the section ends.
    while (items[i] && !equal(item, items[i]) &&
        compare(item, items[i]) === 0) i += 1;
    
    var found = equal(item, items[i]);
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
