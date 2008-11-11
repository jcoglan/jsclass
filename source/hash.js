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
    this._buckets = {};
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
   * @returns {Object}
   */
  get: function(key) {
    var pair = this._findPair(key);
    return pair ? pair.value : undefined;
  },
  
  /**
   * @param {Object} key
   * @param {Object} value
   * @returns {Hash}
   */
  put: function(key, value) {
    this._findPair(key, true).setValue(value);
    return this;
  },
  
  /**
   * @returns {Number}
   */
  size: function() {
    var n = 0;
    this.forEach(function() { n += 1 });
    return n;
  },
  
  /**
   * @param {Object} key
   * @param {Boolean} createIfAbsent
   * @returns {Hash.Pair}
   */
  _findPair: function(key, createIfAbsent) {
    var hash   = key.hash ? key.hash() : key,
        bucket = this._buckets[hash] || (this._buckets[hash] = []),
        i      = bucket.length,
        pair   = null;
        
    while (i--) {
      if (bucket[i].key.equals(key)) return bucket[i];
    }
    
    if (!createIfAbsent) return null;
    
    pair = new this.klass.Pair;
    pair.setKey(key);
    bucket.push(pair);
    return pair;
  }
});

