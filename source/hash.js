/**
 * @constructor
 * @class Hash
 */
JS.Hash = new JS.Class(/** @scope Hash.prototype */{
  include: JS.Enumerable || {},
  
  extend: /** @scope Hash */{
    
    /**
     * @constructor
     * @class Hash.Pair
     */
    Pair: new JS.Class(/** @scope Hash.Pair.prototype */{
      /**
       * @param {Object} key
       */
      setKey: function(key) {
        this[0] = this.key = key;
      },
      
      /**
       * @param {Object} value
       */
      setValue: function(value) {
        this[1] = this.value = value;
      }
    })
  },
  
  /**
   * @param {Enumerable} list
   */
  initialize: function(list) {
    this.clear();
    if (!list) return;
    for (var i = 0, n = list.length; i < n; i += 2)
      this.put(list[i], list[i+1]);
  },
  
  /**
   * @param {Function} block
   * @param {Object} scope
   */
  forEach: function(block, scope) {
    var hash, bucket, i;
    for (hash in this._buckets) {
      if (!this._buckets.hasOwnProperty(hash)) continue;
      bucket = this._buckets[hash];
      i = bucket.length;
      while (i--) block.call(scope || null, bucket[i]);
    }
  },
  
  /**
   * @param {Object} key
   * @param {Boolean} createIfAbsent
   * @returns {Array}
   */
  _bucketForKey: function(key, createIfAbsent) {
    var hash = key.hash ? key.hash() : key,
        bucket = this._buckets[hash];
    
    if (!bucket && createIfAbsent)
      bucket = this._buckets[hash] = [];
    
    return bucket;
  },
  
  /**
   * @param {Array} bucket
   * @param {Object} key
   * @returns {Hash.Pair}
   */
  _indexInBucket: function(bucket, key) {
    var i     = bucket.length,
        ident = !!this._compareByIdentity;
        
    while (i--) {
      if (ident ? (bucket[i].key === key) : bucket[i].key.equals(key))
        return i;
    }
    return -1;
  },
  
  /**
   * @param {Object} key
   * @param {Boolean} createIfAbsent
   * @returns {Hash.Pair}
   */
  assoc: function(key, createIfAbsent) {
    var bucket = this._bucketForKey(key, createIfAbsent);
    if (!bucket) return null;
    
    var index = this._indexInBucket(bucket, key);
    if (index > -1) return bucket[index];
    if (!createIfAbsent) return null;
    
    this.size += 1; this.length += 1;
    pair = new this.klass.Pair;
    pair.setKey(key);
    bucket.push(pair);
    return pair;
  },
  
  /**
   */
  clear: function() {
    this._buckets = {};
    this.length = this.size = 0;
  },
  
  /**
   */
  compareByIdentity: function() {
    this._compareByIdentity = true;
  },
  
  /**
   * @returns {Boolean}
   */
  comparesByIdentity: function() {
    return !!this._compareByIdentity;
  },
  
  /**
   * @param {Object} value
   */
  setDefault: function(value) {
    this._default = value;
  },
  
  /**
   * @param {Object} key
   * @returns {Object}
   */
  getDefault: function(key) {
    return JS.isFn(this._default)
        ? this._default(key)
        : (this._default || null);
  },
  
  /**
   * @returns {Boolean}
   */
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
  
  /**
   * @param {Object} key
   * @param {Object} defaultValue
   * @returns {Object}
   */
  fetch: function(key, defaultValue) {
    var pair = this.assoc(key);
    if (pair) return pair.value;
    
    if (defaultValue === undefined) throw new Error('key not found');
    if (JS.isFn(defaultValue)) return defaultValue(key);
    return defaultValue;
  },
  
  /**
   * @param {Function} block
   * @param {Object} scope
   */
  forEachKey: function(block, scope) {
    this.forEach(function(pair) {
      block.call(scope || null, pair.key);
    });
  },
  
  /**
   * @param {Function} block
   * @param {Object} scope
   */
  forEachPair: function(block, scope) {
    this.forEach(function(pair) {
      block.call(scope || null, pair.key, pair.value);
    });
  },
  
  /**
   * @param {Function} block
   * @param {Object} scope
   */
  forEachValue: function(block, scope) {
    this.forEach(function(pair) {
      block.call(scope || null, pair.value);
    });
  },
  
  /**
   * @param {Object} key
   * @returns {Object}
   */
  get: function(key) {
    var pair = this.assoc(key);
    return pair ? pair.value : this.getDefault(key);
  },
  
  /**
   * @param {Object} key
   * @returns {Boolean}
   */
  hasKey: function(key) {
    return !!this.assoc(key);
  },
  
  /**
   * @param {Object} value
   * @returns {Boolean}
   */
  hasValue: function(value) {
    var has = false, ident = !!this._compareByIdentity;
    this.forEach(function(pair) {
      if ((value.equals && !ident) ? value.equals(pair.value) : value === pair.value)
        has = true;
    });
    return has;
  },
  
  /**
   * @returns {Hash}
   */
  invert: function() {
    var hash = new this.klass;
    this.forEach(function(pair) {
      hash.put(pair.value, pair.key);
    });
    return hash;
  },
  
  /**
   * @returns {Boolean}
   */
  isEmpty: function() {
    for (var hash in this._buckets) {
      if (this._buckets.hasOwnProperty(hash) && this._buckets[hash].length > 0)
        return false;
    }
    return true;
  },
  
  /**
   * @param {Object} value
   * @returns {Object}
   */
  key: function(value) {
    var result = null;
    this.forEach(function(pair) {
      if (value.equals ? value.equals(pair.value) : (value === pair.value))
        result = pair.key;
    });
    return result;
  },
  
  /**
   * @returns {Array}
   */
  keys: function() {
    var keys = [];
    this.forEach(function(pair) { keys.push(pair.key) });
    return keys;
  },
  
  /**
   * @param {Hash} hash
   * @returns {Hash}
   */
  merge: function(hash) {
    var newHash = new this.klass;
    newHash.update(this);
    newHash.update(hash);
    return newHash;
  },
  
  /**
   * @param {Object} key
   * @param {Object} value
   * @returns {Hash}
   */
  put: function(key, value) {
    this.assoc(key, true).setValue(value);
    return this;
  },
  
  /**
   */
  rehash: function() {
    var temp = new this.klass;
    temp._buckets = this._buckets;
    this.clear();
    this.update(temp);
  },
  
  /**
   * @param {Object} key
   * @returns {Object}
   */
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
  
  /**
   * @param {Function} predicate
   * @param {Object} scope
   */
  removeIf: function(predicate, scope) {
    this.forEach(function(pair) {
      if (predicate.call(scope || null, pair))
        this.remove(pair.key);
    }, this);
  },
  
  /**
   * [TODO] support blocks for duplicate key decisions
   * @param {Hash} hash
   */
  update: function(hash) {
    hash.forEach(function(pair) {
      this.put(pair.key, pair.value);
    }, this);
  },
  
  /**
   * @returns {Array}
   */
  values: function() {
    var values = [];
    this.forEach(function(pair) { values.push(pair.value) });
    return values;
  }
});

