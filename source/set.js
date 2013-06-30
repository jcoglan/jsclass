(function(factory) {
  var E  = (typeof exports === 'object'),
      js = (typeof JS === 'undefined') ? require('./core') : JS,

      Enumerable = js.Enumerable || require('./enumerable').Enumerable,
      hash = js.Hash ? js : require('./hash');

  if (E) exports.JS = exports;
  factory(js, Enumerable, hash, E ? exports : js);

})(function(JS, Enumerable, hash, exports) {
'use strict';

var Set = new JS.Class('Set', {
  extend: {
    forEach: function(list, block, context) {
      if (!list || !block) return;
      if (list.forEach) return list.forEach(block, context);
      for (var i = 0, n = list.length; i < n; i++) {
        if (list[i] !== undefined)
          block.call(context, list[i], i);
      }
    }
  },

  include: Enumerable || {},

  initialize: function(list, block, context) {
    this.clear();
    if (block) this.klass.forEach(list, function(item) {
      this.add(block.call(context, item));
    }, this);
    else this.merge(list);
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);

    this._members.forEachKey(block, context);
    return this;
  },

  add: function(item) {
    if (this.contains(item)) return false;
    this._members.store(item, true);
    this.length = this.size = this._members.length;
    return true;
  },

  classify: function(block, context) {
    if (!block) return this.enumFor('classify');
    block = Enumerable.toFn(block);

    var classes = new hash.Hash();
    this.forEach(function(item) {
      var value = block.call(context, item);
      if (!classes.hasKey(value)) classes.store(value, new this.klass);
      classes.get(value).add(item);
    }, this);
    return classes;
  },

  clear: function() {
    this._members = new hash.Hash();
    this.size = this.length = 0;
  },

  complement: function(other) {
    var set = new this.klass;
    this.klass.forEach(other, function(item) {
      if (!this.contains(item)) set.add(item);
    }, this);
    return set;
  },

  contains: function(item) {
    return this._members.hasKey(item);
  },

  difference: function(other) {
    other = JS.isType(other, Set) ? other : new Set(other);
    var set = new this.klass;
    this.forEach(function(item) {
      if (!other.contains(item)) set.add(item);
    });
    return set;
  },

  divide: function(block, context) {
    if (!block) return this.enumFor('divide');
    block = Enumerable.toFn(block);

    var classes = this.classify(block, context),
        sets    = new Set;

    classes.forEachValue(sets.method('add'));
    return sets;
  },

  equals: function(other) {
    if (this.length !== other.length || !JS.isType(other, Set)) return false;
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },

  hash: function() {
    var hashes = [];
    this.forEach(function(object) { hashes.push(hash.Hash.codeFor(object)) });
    return hashes.sort().join('');
  },

  flatten: function(set) {
    var copy = new this.klass;
    copy._members = this._members;
    if (!set) { set = this; set.clear(); }
    copy.forEach(function(item) {
      if (JS.isType(item, Set)) item.flatten(set);
      else set.add(item);
    });
    return set;
  },

  inspect: function() {
    return this.toString();
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

  isProperSuperset: function(other) {
    return this._members.length > other._members.length && this.isSuperset(other);
  },

  isSubset: function(other) {
    var result = true;
    this.forEach(function(item) {
      if (!result) return;
      if (!other.contains(item)) result = false;
    });
    return result;
  },

  isSuperset: function(other) {
    return other.isSubset(this);
  },

  keepIf: function(block, context) {
    return this.removeIf(function() {
      return !block.apply(context, arguments);
    });
  },

  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },

  product: function(other) {
    var pairs = new Set;
    this.forEach(function(item) {
      this.klass.forEach(other, function(partner) {
        pairs.add([item, partner]);
      });
    }, this);
    return pairs;
  },

  rebuild: function() {
    this._members.rehash();
    this.length = this.size = this._members.length;
  },

  remove: function(item) {
    this._members.remove(item);
    this.length = this.size = this._members.length;
  },

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    this._members.removeIf(function(pair) {
      return block.call(context, pair.key);
    });
    this.length = this.size = this._members.length;
    return this;
  },

  replace: function(other) {
    this.clear();
    this.merge(other);
  },

  subtract: function(list) {
    this.klass.forEach(list, function(item) {
      this.remove(item);
    }, this);
  },

  toString: function() {
    var items = [];
    this.forEach(function(item) {
      items.push(item.toString());
    });
    return this.klass.displayName + ':{' + items.join(',') + '}';
  },

  union: function(other) {
    var set = new this.klass;
    set.merge(this);
    set.merge(other);
    return set;
  },

  xor: function(other) {
    var set = new this.klass(other);
    this.forEach(function(item) {
      set[set.contains(item) ? 'remove' : 'add'](item);
    });
    return set;
  },

  _indexOf: function(item) {
    var i    = this._members.length,
        Enum = Enumerable;

    while (i--) {
      if (Enum.areEqual(item, this._members[i])) return i;
    }
    return -1;
  }
});

Set.alias({
  n:  'intersection',
  u:  'union',
  x:  'product'
});

var OrderedSet = new JS.Class('OrderedSet', Set, {
  clear: function() {
    this._members = new hash.OrderedHash();
    this.size = this.length = 0;
  }
});

var SortedSet = new JS.Class('SortedSet', Set, {
  extend: {
    compare: function(one, another) {
      return JS.isType(one, Object)
          ? one.compareTo(another)
          : (one < another ? -1 : (one > another ? 1 : 0));
    }
  },

  forEach: function(block, context) {
    if (!block) return this.enumFor('forEach');
    block = Enumerable.toFn(block);
    this.klass.forEach(this._members, block, context);
    return this;
  },

  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return false;
    this._members.splice(point, 0, item);
    this.length = this.size = this._members.length;
    return true;
  },

  clear: function() {
    this._members = [];
    this.size = this.length = 0;
  },

  contains: function(item) {
    return this._indexOf(item) !== -1;
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

  removeIf: function(block, context) {
    if (!block) return this.enumFor('removeIf');
    block = Enumerable.toFn(block);

    var members = this._members,
        i       = members.length;

    while (i--) {
      if (block.call(context, members[i]))
        this.remove(members[i]);
    }
    return this;
  },

  _indexOf: function(item, insertionPoint) {
    var items   = this._members,
        n       = items.length,
        i       = 0,
        d       = n,
        compare = this.klass.compare,
        Enum    = Enumerable,
        found;

    if (n === 0) return insertionPoint ? 0 : -1;

    if (compare(item, items[0]) < 1)   { d = 0; i = 0; }
    if (compare(item, items[n-1]) > 0) { d = 0; i = n; }

    while (!Enum.areEqual(item, items[i]) && d > 0.5) {
      d = d / 2;
      i += (compare(item, items[i]) > 0 ? 1 : -1) * Math.round(d);
      if (i > 0 && compare(item, items[i-1]) > 0 && compare(item, items[i]) < 1) d = 0;
    }

    // The pointer will end up at the start of any homogenous section. Step
    // through the section until we find the needle or until the section ends.
    while (items[i] && !Enum.areEqual(item, items[i]) &&
        compare(item, items[i]) === 0) i += 1;

    found = Enum.areEqual(item, items[i]);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  }
});

Enumerable.include({
  toSet: function(klass, block, context) {
    klass = klass || Set;
    return new klass(this, block, context);
  }
});

exports.Set = exports.HashSet = Set;
exports.OrderedSet = OrderedSet;
exports.SortedSet = SortedSet;
});

