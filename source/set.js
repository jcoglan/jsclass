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
    this._members = [];
    if (block) this.klass.forEach(list, function(item) {
      this.add(block.call(context || null, item));
    }, this);
    else this.merge(list);
  },
  
  forEach: function(block, context) {
    this.klass.forEach(this._members, block, context);
  },
  
  add: function(item) {
    if (this.hasMember(item)) return;
    this._members.push(item);
  },
  
  hasMember: function(item) {
    return this._indexOf(item) != -1;
  },
  
  merge: function(list) {
    this.klass.forEach(list, function(item) { this.add(item) }, this);
  },
  
  size: function() {
    return this._members.length;
  },
  
  _indexOf: function(item) {
    return this._members.indexOf(item);
  }
});

JS.SortedSet = new JS.Class(JS.Set, {
  extend: {
    compare: function(one, another) {
      if (one === undefined || another === undefined) return 0;
      return (one.compareTo && one.compareTo(another)) ||
             (one < another ? -1 : (one > another ? 1 : 0));
    }
  },
  
  initialize: function() {
    this._hasComparable = false;
    this.callSuper();
  },
  
  add: function(item) {
    this._hasComparable = this._hasComparable || !!item.compareTo;
    var point = this._indexOf(item, true);
    if (point === null) return;
    this._members.splice(point, 0, item);
  },
  
  _indexOf: function(item, insertionPoint) {
    if (this._hasComparable) return this._indexOfComparable(item, insertionPoint);
    var items = this._members, n = items.length, i = 0, d = n;
    if (item < items[0])   { d = 0; i = 0; }
    if (item > items[n-1]) { d = 0; i = n; }
    while (items[i] !== item && d > 0.5) {
      d = d / 2;
      i += Math.round(d) * (items[i] < item ? 1 : -1);
      if (i > 0 && items[i-1] < item && items[i] >= item) d = 0;
    }
    var found = (items[i] === item);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  },
  
  _indexOfComparable: function(item, insertionPoint) {
    var items = this._members, n = items.length, i = 0, d = n;
    var c = this.klass.compare;
    if (c(item, items[0]) == -1)  { d = 0; i = 0; }
    if (c(item, items[n-1]) == 1) { d = 0; i = n; }
    while (items[i] !== item && d > 0.5) {
      d = d / 2;
      i += Math.round(d) * (c(items[i], item) == -1 ? 1 : -1);
      if (i > 0 && c(items[i-1], item) == -1 && c(items[i], item) > -1) d = 0;
    }
    var found = (items[i] === item);
    return insertionPoint
        ? (found ? null : i)
        : (found ? i : -1);
  }
});
