JS.Hash = new JS.Class('Hash', {
  include: JS.Enumerable || {},
  
  extend: {
    Pair: new JS.Class({
      include: JS.Comparable || {},
      
      setKey: function(key) {
        this[0] = this.key = key;
      },
      
      setValue: function(value) {
        this[1] = this.value = value;
      },
      
      compareTo: function(other) {
        return this.key.compareTo
            ? this.key.compareTo(other.key)
            : (this.key < other.key ? -1 : (this.key > other.key ? 1 : 0));
      }
    })
  },
  
  initialize: function(object) {
    this.clear();
    var proc = object, self = this;
    if (JS.isFn(proc)) object = function(key) { return proc(self, key) };
    if (!(object instanceof Array)) return this.setDefault(object);
    for (var i = 0, n = object.length; i < n; i += 2)
      this.store(object[i], object[i+1]);
  },
  
  forEach: function(block, scope) {
    var hash, bucket, i;
    for (hash in this._buckets) {
      if (!this._buckets.hasOwnProperty(hash)) continue;
      bucket = this._buckets[hash];
      i = bucket.length;
      while (i--) block.call(scope || null, bucket[i]);
    }
  },
  
  _bucketForKey: function(key, createIfAbsent) {
    var hash = key.hash ? key.hash() : key,
        bucket = this._buckets[hash];
    
    if (!bucket && createIfAbsent)
      bucket = this._buckets[hash] = [];
    
    return bucket;
  },
  
  _indexInBucket: function(bucket, key) {
    var i     = bucket.length,
        ident = !!this._compareByIdentity;
        
    while (i--) {
      if (ident ? (bucket[i].key === key) : bucket[i].key.equals(key))
        return i;
    }
    return -1;
  },
  
  _assoc: function(key, createIfAbsent) {
    var bucket = this._bucketForKey(key, createIfAbsent);
    if (!bucket) return null;
    
    var index = this._indexInBucket(bucket, key);
    if (index > -1) return bucket[index];
    if (!createIfAbsent) return null;
    
    this.size += 1; this.length += 1;
    var pair = new this.klass.Pair;
    pair.setKey(key);
    bucket.push(pair);
    return pair;
  },
  
  clear: function() {
    this._buckets = {};
    this.length = this.size = 0;
  },
  
  compareByIdentity: function() {
    this._compareByIdentity = true;
  },
  
  comparesByIdentity: function() {
    return !!this._compareByIdentity;
  },
  
  setDefault: function(value) {
    this._default = value;
    return this;
  },
  
  getDefault: function(key) {
    return JS.isFn(this._default)
        ? this._default(key)
        : (this._default || null);
  },
  
  equals: function(other) {
    if (this.length !== other.length || !(other instanceof JS.Hash))
      return false;
    var result = true;
    this.forEach(function(pair) {
      var otherValue = other.get(pair.key),
          equal = otherValue.equals
              ? otherValue.equals(pair.value)
              : (otherValue === pair.value);
      if (!equal) result = false;
    });
    return result;
  },
  
  fetch: function(key, defaultValue) {
    var pair = this._assoc(key);
    if (pair) return pair.value;
    
    if (defaultValue === undefined) throw new Error('key not found');
    if (JS.isFn(defaultValue)) return defaultValue(key);
    return defaultValue;
  },
  
  forEachKey: function(block, scope) {
    this.forEach(function(pair) {
      block.call(scope || null, pair.key);
    });
  },
  
  forEachPair: function(block, scope) {
    this.forEach(function(pair) {
      block.call(scope || null, pair.key, pair.value);
    });
  },
  
  forEachValue: function(block, scope) {
    this.forEach(function(pair) {
      block.call(scope || null, pair.value);
    });
  },
  
  get: function(key) {
    var pair = this._assoc(key);
    return pair ? pair.value : this.getDefault(key);
  },
  
  hasKey: function(key) {
    return !!this._assoc(key);
  },
  
  hasValue: function(value) {
    var has = false, ident = !!this._compareByIdentity;
    this.forEach(function(pair) {
      if ((value.equals && !ident) ? value.equals(pair.value) : value === pair.value)
        has = true;
    });
    return has;
  },
  
  invert: function() {
    var hash = new this.klass;
    this.forEach(function(pair) {
      hash.store(pair.value, pair.key);
    });
    return hash;
  },
  
  isEmpty: function() {
    for (var hash in this._buckets) {
      if (this._buckets.hasOwnProperty(hash) && this._buckets[hash].length > 0)
        return false;
    }
    return true;
  },
  
  key: function(value) {
    var result = null;
    this.forEach(function(pair) {
      if (value.equals ? value.equals(pair.value) : (value === pair.value))
        result = pair.key;
    });
    return result;
  },
  
  keys: function() {
    var keys = [];
    this.forEach(function(pair) { keys.push(pair.key) });
    return keys;
  },
  
  merge: function(hash) {
    var newHash = new this.klass;
    newHash.update(this);
    newHash.update(hash);
    return newHash;
  },
  
  rehash: function() {
    var temp = new this.klass;
    temp._buckets = this._buckets;
    this.clear();
    this.update(temp);
  },
  
  remove: function(key) {
    var bucket = this._bucketForKey(key);
    if (!bucket) return null;
    
    var index = this._indexInBucket(bucket, key);
    if (index < 0) return null;
    
    var result = bucket[index];
    bucket.splice(index, 1);
    this.size -= 1;
    this.length -= 1;
    
    if (bucket.length === 0)
      delete this._buckets[key.hash ? key.hash() : key];
    
    return result;
  },
  
  removeIf: function(predicate, scope) {
    this.forEach(function(pair) {
      if (predicate.call(scope || null, pair))
        this.remove(pair.key);
    }, this);
  },
  
  store: function(key, value) {
    this._assoc(key, true).setValue(value);
    return value;
  },
  
  update: function(hash) {
    hash.forEach(function(pair) {
      this.store(pair.key, pair.value);
    }, this);
  },
  
  values: function() {
    var values = [];
    this.forEach(function(pair) { values.push(pair.value) });
    return values;
  }
});

JS.Hash.include({
  put: JS.Hash.instanceMethod('store')
});

