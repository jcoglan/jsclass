this.JS = this.JS || {};

JS.Package = function(loader) {
  var Set = JS.Package.OrderedSet;
  JS.Package._index(this);
  
  this._loader    = loader;
  this._names     = new Set();
  this._deps      = new Set();
  this._uses      = new Set();
  this._observers = {};
  this._events    = {};
};

(function() {
  var Set = JS.Package.OrderedSet = function() {
    this._members = this.list = [];
    this._index = {};
    this.length = 0;
  };

  Set.prototype.push = function(item) {
    var key   = (item.id !== undefined) ? item.id : item,
        index = this._index;
    
    if (index.hasOwnProperty(key)) return;
    index[key] = this._members.length;
    this._members.push(item);
    this.length = this._members.length;
  };
})();

(function(klass) {
  var instance = klass.prototype;
  
  //================================================================
  // Configuration methods, called by the DSL
  
  instance.addDependency = function(pkg) {
    this._deps.push(pkg);
  };
  
  instance.addSoftDependency = function(pkg) {
    this._uses.push(pkg);
  };
  
  instance.addName = function(name) {
    this._names.push(name);
    klass.getFromCache(name).pkg = this;
  };
  
  instance.onload = function(block) {
    this._onload = block;
  };
  
  //================================================================
  // Event dispatchers, for communication between packages
  
  instance.on = function(eventType, block, scope) {
    if (this._events[eventType]) return block.call(scope);
    var list = this._observers[eventType] = this._observers[eventType] || [];
    list.push([block, scope]);
  };
  
  instance.fire = function(eventType) {
    if (this._events[eventType]) return false;
    this._events[eventType] = true;
    
    var list = this._observers[eventType];
    if (!list) return true;
    delete this._observers[eventType];
    
    for (var i = 0, n = list.length; i < n; i++)
      list[i][0].call(list[i][1]);
    
    return true;
  };
  
  //================================================================
  // Loading frontend and other miscellany
  
  instance.isLoaded = function(withExceptions) {
    if (!withExceptions && this._isLoaded !== undefined) return this._isLoaded;
    
    var names = this._names.list,
        i     = names.length,
        name, object;
    
    while (i--) { name = names[i];
      object = klass.getObject(name);
      if (object !== undefined) continue;
      if (withExceptions)
        throw new Error('Expected package at ' + this._loader + ' to define ' + name);
      else
        return this._isLoaded = false;
    }
    return this._isLoaded = true;
  };
  
  instance.load = function() {
    if (!this.fire('request')) return;
    
    klass.oncomplete(this._deps.list, function() {
      var self = this,
      
          waitForSoftDeps = function() {
            klass.oncomplete(self._uses.list, function() { self.fire('complete') });
          },
          
          fireOnLoad = function() {
            if (self._onload) self._onload();
            self.isLoaded(true);
            self.fire('load');
            waitForSoftDeps();
          };
      
      if (this.isLoaded()) return waitForSoftDeps();
      
      if (this._loader === undefined)
        throw new Error('No load path found for ' + this._names.list[0]);
      
      typeof this._loader === 'function'
            ? this._loader(fireOnLoad)
            : klass.Loader.loadFile(this._loader, fireOnLoad);
    }, this);
  };
  
  instance.toString = function() {
    return 'Package:' + this._names.list.join(',');
  };
  
  //================================================================
  // Class-level event API, handles group listeners
  
  klass.oncomplete = function(names, block, scope) {
    var packages = new klass.OrderedSet(), i = names.length;
    while (i--) packages.push(this.getByName(names[i]));
    
    var waiting = i = packages.list.length, object;
    if (waiting === 0) return block && block.call(scope);
    
    while (i--) {
      object = packages.list[i];
      object.on('complete', function() {
        waiting -= 1;
        if (waiting === 0 && block) block.call(scope);
      });
      object.load();
    }
  };
  
  //================================================================
  // Indexes for fast lookup by path and name, and assigning IDs
  
  klass._autoIncrement = 1;
  klass._env = this;
  klass._indexByPath = {};
  klass._indexByName = {};
  
  klass._index = function(pkg) {
    pkg.id = this._autoIncrement;
    this._autoIncrement += 1;
  };
  
  klass.getByPath = function(loader) {
    var path = loader.toString();
    return this._indexByPath[path] = this._indexByPath[path] || new this(loader);
  };
  
  klass.getByName = function(name) {
    var cached = this.getFromCache(name);
    if (cached.pkg) return cached.pkg;
    
    var placeholder = new this();
    placeholder.addName(name);
    return placeholder;
  };
  
  //================================================================
  // Cache for named packages and runtime objects
  
  klass.getFromCache = function(name) {
    return this._indexByName[name] = this._indexByName[name] || {};
  };
  
  klass.getObject = function(name) {
    var cached = this.getFromCache(name);
    if (cached.obj !== undefined) return cached.obj;
    
    var object = this._env,
        parts  = name.split('.'), part;
    
    while (part = parts.shift()) object = object && object[part];
    
    return this.getFromCache(name).obj = object;
  };
  
})(JS.Package);

