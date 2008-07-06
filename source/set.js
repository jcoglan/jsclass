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
  
  initialize: function(list) {
    this._members = [];
    this.klass.forEach(list, function(item) {
      this.add(item);
    }, this);
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
  
  size: function() {
    return this._members.length;
  },
  
  _indexOf: function(item) {
    return this._members.indexOf(item);
  }
});

JS.SortedSet = new JS.Class(JS.Set, {
  add: function(item) {
    var point = this._indexOf(item, true);
    if (point === null) return;
    this._members.splice(point, 0, item);
  },
  
  _indexOf: function(item, insertionPoint) {
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
  }
});
