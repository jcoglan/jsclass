if (typeof JS == 'undefined') JS = {};

/**
 * @overview
 * <p>JS.Class, classical inheritance for JavaScript.<br />
 * Copyright (c) 2007 James Coglan.<br />
 * Based on MIT-licensed work by Sam Stephenson and the Prototype team
 * (<a href="http://prototypejs.org">website</a>) and BSD-licensed work by Alex Arnell
 * (<a href="http://twologic.com/projects/inheritance/">website</a>).<br />
 * This work is released under an MIT license.</p>
 *
 * <h3>Introduction</h3>
 *
 * <p><tt>JS.Class</tt> provides a classical inheritance model for JavaScript, allowing
 * single inheritance from other classes, mixins (a-la Ruby), and <tt>super()</tt> calling
 * like in Java and Ruby. Current support for classical inheritance in the major libraries
 * is quite poor; Prototype's is broken if you want to compress your code, and Y!UI's attempt
 * at supporting classical inheritance is barely usable (see
 * <a href="http://developer.yahoo.com/yui/yahoo/#extend">these examples</a>), resulting in
 * far too much repetition and a lack of clarity.</p>
 *
 * <p>Our inheritance model is based on work by the Prototype team and by Alex Arnell. It uses
 * idioms from Ruby, although it should be reasonably intelligeable to Java programmers too.</p>
 *
 * <ul>
 *      <li><a href="http://prototypejs.org/api/class/create"><tt>Class.create()</tt></a>
 *          in Prototype 1.6</li>
 *      <li><a href="http://www.twologic.com/projects/inheritance/">Inheritance.js</a> by
 *          Alex Arnell</li>
 * </ul>
 *
 * <p>Unfortunately, Prototype's inheritance model is not compatible with code compressors
 * that shrink variable names (it detects arguments called <tt>$super</tt> and wraps inherited
 * methods where necessary). It claims to be based on Alex Arnell's implementation, which does
 * not inspect argument names. It does, however, allow the use of Rubyish constructs and does
 * not introduce extra method arguments. Arnell's code was itself influenced by Dean Edwards'
 * <a href="http://dean.edwards.name/weblog/2006/03/base/">Base class</a> model.</p>
 *
 * <h3>Design goals</h3>
 *
 * <p>In broad terms, <tt>JS.Class</tt> aims to give a Ruby-like model of classical inheritance
 * to JavaScript programmers. Ruby and JavaScript share many common features and porting code
 * between them can be straightforward. Both support mixin-style inheritance, and both have
 * first-class functions (<tt>Proc</tt> and <tt>lambda</tt> in Ruby). Implementing classical
 * OOP in JavaScript (as the previously mentioned YU!I example demonstrates) can get very
 * messy very quickly, resulting in difficult-to-read, repetitive (and therefore brittle) class
 * definitions. The aims of <tt>JS.Class</tt>, then, are:</p>
 *
 * <ul>
 *      <li>Provide an elegant means of single-parent inheritance of instance and class methods</li>
 *      <li>Allow subclasses to be augmented instantly with methods added to their parents</li>
 *      <li>Keep everything as <a href="http://en.wikipedia.org/wiki/Don't_repeat_yourself">DRY</a>
 *          as possible</li>
 *      <li>Add <tt>super</tt>, and make its arguments optional (avoid argument repetition)</li>
 *      <li>Allow instance methods to know which class they are being called in without needing to
 *          know its name, and to access said class, its methods, properties and parent classes
 *          (avoid class name repetition)</li>
 * </ul>
 *
 * <h3>Basic class definitions</h3>
 *
 * <p>The best way to explain how to use it is with a few examples. Each class definition should
 * have an <tt>initialize</tt> method, which will act as its constructor. To add class methods,
 * wrap them up inside an <tt>extend</tt> block.</p>
 *
 * <pre><code>    var Animal = JS.Class({
 *         extend: {
 *            find: function(options) { return 'finding...'; },
 *            findByName: function(name) { return this.find({name: name}); }
 *         },
 *         initialize: function(name) {
 *             this.name = name;
 *         },
 *         speak: function() {
 *             alert('My name is ' + this.name);
 *         }
 *     });</code></pre>
 *
 * <h3>Inheritance and subclasses, using <tt>this._super</tt></h3>
 *
 * <p>If you want to create a subclass of <tt>Animal</tt>, pass it in as the first argument to
 * <tt>JS.Class()</tt>. Within the subclass' methods, <tt>this._super</tt> will refer to
 * the parent class' copy of the method.</p>
 *
 * <pre><code>    var Bear = JS.Class(Animal, {
 *         // We inherit the initialize() method from Animal
 *         // --> no need to redefine it!
 *         
 *         speak: function(thing) {
 *             this._super();
 *             alert('I like ' + thing);
 *         }
 *     });</code></pre>
 *
 * <p>(<tt>super</tt> is a reserved word in JavaScript, hence <tt>this._super</tt>.) Let's try
 * using these classes:</p>
 *
 * <pre><code>    new Animal('Kermit').speak();
 *     // --> alerts "My name is Kermit"
 *     
 *     new Bear('Yogi').speak('picnic baskets');
 *     // --> alerts "My name is Yogi", then "I like picnic baskets"</code></pre>
 *
 * <p>In common with the Ruby method of doing things, passing arguments to <tt>this._super</tt>
 * is entirely optional. By default, <tt>this._super</tt> will use the arguments given to the
 * current method, but you can override them if you need to. e.g.:</p>
 *
 * <pre><code>    var Insect = JS.Class(Animal, {
 *         initialize: function(name, type) {
 *             this._super();  // Sets the name, no need to pass it in
 *             this.type = type;
 *         }
 *     });
 *     
 *     var bee = new Insect('Buzz', 'bee');
 *     // --> bee.name == "Buzz", bee.type == "bee"</code></pre>
 *
 * <p>Subclasses inherit all the instance and class methods from the parent, so in the above
 * example you could call <tt>Bear.find()</tt>. Class methods also support the use of
 * <tt>this._super</tt>, just like in instance methods.</p>
 *
 * <p>Getting <tt>this._super</tt> to work requires a fairly large performance overhead as
 * JavaScript has to wrap your methods with other functions that inspect classes, decide whether
 * there is a <tt>super</tt> method, and assign new functions to <tt>this._super</tt> on the
 * fly before calling your original function. To get around this, <tt>JS.Class</tt> inspects
 * your method definitions to see if they contain references to <tt>this._super</tt>. If a
 * method contains no such reference, it is inserted straight into the class' <tt>prototype</tt>
 * without wrapping it in another function. This can boost performance quite significantly.</p>
 *
 * <h3>Traversing the inheritance tree</h3>
 *
 * <p>Every class is automatically given a <tt>superclass</tt> property, which is a reference
 * to the class' parent class function. If the class does not have an explicit superclass,
 * this reference defaults to <tt>Object</tt>. Using the examples above, <tt>Bear.superclass</tt>
 * is <tt>Animal</tt>, and <tt>Animal.superclass</tt> is <tt>Object</tt>. Every class also
 * has a <tt>subclasses</tt> property, which is an array of classes that inherit from it.</p>
 *
 * <p>Instances are all given a <tt>klass</tt> property, which is a pointer to their class
 * function. You can use this to access class methods, or traverse the tree...</p>
 *
 * <pre><code>    var Cow = JS.Class(Animal, {
 *         // Returns a new Animal instance with the given name
 *         generate: function(name) {
 *             return new this.klass.superclass(name);
 *         }
 *     });</code></pre>
 *
 * <p>Finally, each instance also has a <tt>is_a()</tt> method, which works just like its Ruby
 * namesake. It returns <tt>true</tt> iff the given class is the instance's class, or one of
 * its ancestors.</p>
 *
 * <pre><code>    var daisy = new Cow('Daisy');
 *     daisy.is_a(Cow)     // --> true
 *     daisy.is_a(Animal)  // --> true
 *     daisy.is_a(Object)  // --> true
 *     daisy.is_a(Bear)    // --> false</code></pre>
 *
 * <h3>Module design</h3>
 *
 * <p>It is common practise in Ruby, in order not to polute the global namespace, to nest classes
 * within one another. That is, you create one global class, and put the classes used by your
 * class <em>inside</em>:</p>
 *
 * <pre><code>    class Gallery
 *         class Item
 *             def initialize(name)
 *                 # Ignore the backslash, it's there to keep JSDoc happy
 *                 \@name = name.to_s
 *             end
 *         end
 *         
 *         def initialize; end
 *         
 *         def create_item(name)
 *             # You can actually just say Item.new('foo')
 *             # but I'm trying to make a point here...
 *             return self.class::Item.new(name)
 *         end
 *     end</code></pre>
 *
 * <p><tt>JS.Class</tt> allows you to create similar module structures without mentioning the
 * namespace of any class more than once (i.e., when you define it). This is especially useful
 * if you're putting classes in some obscure namespace somewhere and still want to be able to
 * read your code, and change namespaces without breaking loads of references. The above example
 * would look like:</p>
 *
 * <pre><code>    // Let's put this in a namespace to demonstrate...
 *     
 *     Library.Widget.Tools.Gallery = JS.Class({
 *         extend: {
 *             Item: JS.Class({
 *                 initialize: function(name) {
 *                     this.name = String(name);
 *                 }
 *             })
 *         },
 *         
 *         initialize: function() {},
 *         
 *         createItem: function(name) {
 *             // This would be Library.Widget.Tools.Gallery.Item in raw JavaScript
 *             return new this.klass.Item(name);
 *         }
 *     });
 *     
 *     var gal = new Library.Widget.Tools.Gallery();
 *     var item = gal.createItem();
 *     
 *     item.is_a(Library.Widget.Tools.Gallery.Item)
 *     // --> true</code></pre>
 *
 * <p>What happens if you inherit from this?</p>
 *
 * <pre><code>    var Sub = JS.Class(Library.Widget.Tools.Gallery, {
 *         createItem: function(name) {
 *             return this._super(name.toUpperCase());
 *         }
 *     });</code></pre>
 *
 * <p>You'll find that the objects returned by <tt>Sub#createItem</tt> are both <tt>Sub.Item</tt>s
 * and <tt>Gallery.Item</tt>s:</p>
 *
 * <pre><code>    var sub = new Sub();
 *     var item = sub.createItem('cake');   // item.name == 'CAKE'
 *     
 *     item.is_a(Library.Widget.Tools.Gallery.Item)     // --> true
 *     item.is_a(Sub.Item)                              // --> true</code></pre>
 *
 * <p>However, you'll also find that <tt>Library.Widget.Tools.Gallery.Item</tt> and <tt>Sub.Item</tt>
 * have the same superclass: <tt>Object</tt>. In fact, the two classes do not have a parent-child
 * relationship, they are in fact different references to just one function in memory. (This is
 * identical to how Ruby would handle subclassing <tt>Gallery</tt> defined above.) If you would
 * rather subclass, do this instead:</p>
 *
 * <pre><code>    var Sub = JS.Class(Library.Widget.Tools.Gallery, {
 *         extend: {
 *             Item: JS.Class(Library.Widget.Tools.Gallery.Item)
 *         },
 *         createItem: function(name) {
 *             return this._super(name.toUpperCase());
 *         }
 *     });</code></pre>
 *
 * <h3>Mixins and multiple inheritance</h3>
 *
 * <p>You can also inherit functionality from other objects by using mixins. Mixins are a
 * concept taken from Ruby that allow you to include the methods from another module in a
 * class definition, allowing you to share packages of methods between classes. To mixin an
 * object (or objects), use the <tt>include</tt> directive inside your class definition:</p>
 *
 * <pre><code>    // First, define your reusable module...
 *     var ArrayMethods = {
 *         map: function() { ... },
 *         filter: function() { ... },
 *         reduce: function() { ... }
 *     };
 *     
 *     // Then include it in a new class
 *     var SuperArray = JS.Class({
 *         include: [ArrayMethods, SomeOtherModule, ... ],
 *         
 *         initialize: function(args) {
 *             ...
 *         }
 *     });</code></pre>
 *
 * <p>It is worth pointing out that <tt>this._super</tt> will not call methods from mixins,
 * even if the mixins you've included define the right method. <tt>this._super</tt> only ever
 * calls methods from the parent class if one exists, not from mixins. This differs from Ruby,
 * which looks for <tt>super</tt> methods in mixins as well as parent classes.</p>
 *
 * <h3>Automated instance method binding</h3>
 *
 * <p><tt>JS.Class</tt> provides a means of automatically binding methods to class instances
 * when they are created. If part of your class definition includes the directive
 * <tt>bindMethods: true</tt>, every new instance of the class will have its instance methods
 * bound to always execute in its scope. For example:</p>
 *
 * <pre><code>    var Dog = JS.Class(Animal, {
 *         bindMethods: true,
 *         bark: function() {
 *             alert(this.name + ' says WOOF!');
 *         }
 *     });
 *     
 *     var rex = new Dog('Rex');
 *     var bark = rex.bark;
 *     
 *     bark();
 *     // --> alerts "Rex says WOOF!", even though the method was not called on rex</code></pre>
 *
 * <p>This method binding property is not inherited by subclasses, and must be set as required
 * in each class definition.</p>
 *
 * <pre><code>    var Pitbull = JS.Class(Dog);
 *     
 *     var rex = new Pitbull('Rex');
 *     var bark = rex.bark;
 *     
 *     bark();
 *     // --> alerts " says WOOF!", as the method is not bound to rex</code></pre>
 *
 * <h3>Modifying existing classes</h3>
 *
 * <p>There are a bunch of methods for modifying existing classes, including <tt>include</tt>,
 * <tt>method</tt>, <tt>extend</tt> and <tt>classMethod</tt>. All of these are available on any
 * class created using <tt>JS.Class()</tt>, and allow you to add methods to classes and have all
 * their subclasses immediately inherit them. Read their documentation for more information on
 * how to use them. (Full documentation is included in the download.)</p>
 */
JS.Class = function() {
    if (typeof arguments[0] == 'undefined') throw new ReferenceError('Parent class is not defined');
    var args = Array.from(arguments), arg;
    var parent = (typeof args[0] == 'function') ? args.shift() : null;
    var klass = JS.Class.extend(parent);
    while (arg = args.shift()) klass.include(arg);
    return klass;
};

/**
 * <p>Returns a constructor function with all the default class and instance methods in place.
 * Do not use this to build your own classes, use <tt>JS.Class()</tt> instead. Takes an optional
 * <tt>parent</tt> parameter as a class to inherit from.</p>
 * @param {Function} parent
 * @returns {Function}
 */
JS.Class.extend = function(parent) {
    var klass = function() {
        this.klass = arguments.callee;
        JS.Class.setup(this);
        if (typeof this.initialize == 'function')
            this.initialize.apply(this, arguments);
    };
    JS.Class.ify(klass);
    if (typeof parent == 'function') JS.Class.subclass(parent, klass);
    klass.include(JS.Class.INSTANCE_METHODS, false);
    return klass;
};

/**
 * <p>Takes a function as an argument and adds all the methods in <tt>JS.Class.CLASS_METHODS</tt>
 * to it, as well as adding <tt>superclass</tt> and <tt>subclasses</tt> properties.</p>
 *
 * <pre><code>    JS.Class.ify(Array);
 *     // --> now we get Array.include, Array.extend, etc.</code></pre>
 *
 * <p>Set <tt>noExtend</tt> to <tt>true</tt> if you just want to add class hierarchy properties
 * without adding the class methods.</p>
 * @param {Function} klass The constructor function to augment
 * @param {Boolean} noExtend (optional)
 * @returns {Function} The augmented function
 */
JS.Class.ify = function(klass, noExtend) {
    if (typeof klass != 'function') return;
    klass.superclass        = klass.superclass || Object;
    klass.subclasses        = klass.subclasses || [];
    if (noExtend === false) return klass;
    for (var method in JS.Class.CLASS_METHODS)
        klass[method] = JS.Class.CLASS_METHODS[method];
    return klass;
};

/**
 * <p>Sets <tt>klass</tt>'s parent class. Each class can only have one parent class, so calling
 * this repeatedly will cause errors. The child class will inherit all the parent's instance
 * methods <em>and</em> class methods.</p>
 *
 * <p>JavaScript allows subclasses to automatically inherit instance methods added to the
 * superclass after the initial inheritance event. Unfortunately this involves totally
 * overwriting the subclass' <tt>prototype</tt> with an instance of the superclass, so be
 * very careful when using this: you will lose the inheriting class' existing prototype and
 * its subclasses may break.</p>
 *
 * @param {Function} superclass The class to use as the parent
 * @param {Function} klass The inheriting class
 */
JS.Class.subclass = function(superclass, klass) {
    if (typeof superclass != 'function' || typeof klass != 'function') return;
    if (klass.superclass && klass.superclass !== Object)
        throw new ReferenceError('A class may only have one superclass');
    JS.Class.ify(superclass, false);
    klass.superclass = superclass;
    superclass.subclasses.push(klass);
    var bridge = function() {};
    bridge.prototype = superclass.prototype;
    klass.prototype = new bridge();
    klass.extend(superclass);
    return klass;
};

/**
 * <p>Performs setup operations on class instances. For internal consumption.</p>
 * @param {Object} instance
 */
JS.Class.setup = function(instance) {
    var bind;
    if (bind = instance.klass.bindMethods)
        bind(instance);
};

/**
 * <p>Binds all the methods in an instance to the instance's scope.</p>
 * @param {Object} instance
 */
JS.Class.bindMethods = function(instance) {
    for (var method in instance) {
        if (typeof instance[method] == 'function' && method != 'klass')
            instance[method] = instance[method].bind(instance);
    }
};

JS.Class.addMethod = function(klass, object, superObject, name, func) {
    if (typeof func != 'function') return (object[name] = func);
    if (!func.callsSuper()) return (object[name] = func);
    
    var method = function() {
        var _super = superObject[name], args = Array.from(arguments), currentSuper = this._super;
        if (typeof _super == 'function') this._super = function() {
            var i = arguments.length;
            while (i--) args[i] = arguments[i];
            return _super.apply(this, args);
        };
        this._super.valueOf = function() { return _super; };
        this._super.toString = function() { return _super.toString(); };
        var result;
        try { result = func.apply(this, arguments); }
        catch (e) { throw e; }
        finally {
            if (currentSuper) this._super = currentSuper;
            else delete this._super;
        }
        return result;
    };
    method.valueOf = function() { return func; };
    method.toString = function() { return func.toString(); };
    object[name] = method;
};

JS.Class.INSTANCE_METHODS = {
    /**
     * <p>Initializes the instance. All classes should implement this.</p>
     */
    initialize: function() {},
    
    /**
     * <p>Returns <tt>true</tt> if the instance is of the given class, or is of a subclass
     * of the given class.</p>
     * @param {Function} klass
     * @returns {Boolean}
     */
    is_a: function(klass) {
        var _klass = this.klass;
        while (_klass) {
            if (_klass === klass) return true;
            _klass = _klass.superclass;
        }
        return false;
    }
};

JS.Class.CLASS_METHODS = {
    /**
     * <p>Adds instance methods to the class. If any of the methods are missing from the class'
     * subclasses, the subclasses will also receive the new instance methods.</p>
     *
     * <pre><code>    var Animal = JS.Class();
     *     Animal.include({
     *         getName: function() { ... },
     *         startAnimation: function() { ... }
     *     });</code></pre>
     *
     * @param {Object} source A collection of instance methods
     * @param {Boolean} overwrite Should existing methods be overwritten? Defaults to <tt>true</tt>
     */
    include: function(source, overwrite) {
        if (!source) return;
        var modules, i, n;
        if (source.include) {
            modules = (source.include instanceof Array) ? source.include : [source.include];
            for (i = 0, n = modules.length; i < n; i++)
                this.include(modules[i]);
        }
        if (source.extend) {
            modules = (source.extend instanceof Array) ? source.extend : [source.extend];
            for (i = 0, n = modules.length; i < n; i++)
                this.extend(modules[i]);
        }
        if (source.bindMethods) {
            this.bindMethods = JS.Class.bindMethods;
        }
        for (var method in source) {
            if (!/^include|extend|bindMethods$/.test(method))
                this.method(method, source[method], overwrite);
        }
        return this;
    },
    
    /**
     * <p>Adds a single named instance method to the class and all its child classes. Use
     * <tt>this._super</tt> within the function body to refer to methods from the parent
     * class. Any subclasses missing the given method name will immediately inherit it.</p>
     * @param {String} name The name of the method
     * @param {Function} func The method function
     * @param {Boolean} overwrite Should existing methods be overwritten? Defaults to <tt>true</tt>
     */
    method: function(name, func, overwrite) {
        if (!this.prototype[name] || overwrite !== false)
            JS.Class.addMethod(this, this.prototype, this.superclass.prototype, name, func);
        return this;
    },
    
    /**
     * <p>Adds class methods to the class. If any of the methods are missing from the class'
     * subclasses, the subclasses will also receive the new class methods.</p>
     *
     * <pre><code>    var Animal = JS.Class();
     *     Animal.extend({
     *         find: function() { ... },
     *         create: function() { ... }
     *     });</code></pre>
     *
     * @param {Object} source A collection of instance methods
     * @param {Boolean} overwrite Should existing methods be overwritten? Defaults to <tt>true</tt>
     */
    extend: function(source, overwrite) {
        if (!source) return;
        if (typeof source == 'function') source = Function.classProperties(source);
        for (var method in source) this.classMethod(method, source[method], overwrite);
        return this;
    },
    
    /**
     * <p>Adds a single named class method to the class and all its child classes. Use
     * <tt>this._super</tt> within the function body to refer to methods from the parent
     * class. Any subclasses missing the given method name will immediately inherit it.
     * In order for inheritance to take place, you must use this function rather assigning
     * new properties directly to the class' constructor.</p>
     * @param {String} name The name of the method
     * @param {Function} func The method function
     * @param {Boolean} overwrite Should existing methods be overwritten? Defaults to <tt>true</tt>
     */
    classMethod: function(name, func, overwrite) {
        for (var i = 0, n = this.subclasses.length; i < n; i++)
            this.subclasses[i].classMethod(name, func, false);
        if (!this[name] || overwrite !== false)
            JS.Class.addMethod(this, this, this.superclass, name, func);
        return this;
    }
};


Function.prototype.bind = function() {
    if (arguments.length < 2 && arguments[0] === undefined) return this;
    var __method = this, args = Array.from(arguments), object = args.shift();
    return function() {
        return __method.apply(object, args.concat(Array.from(arguments)));
    };
};

Function.prototype.callsSuper = function() {
    var badChar = '[^A-Za-z0-9\\_\\$]', s = '\\s*';
    var regex = new RegExp(badChar + 'this' + s + '(' +
        '\\.' + s + '_super' + badChar +
    '|' +
        '\\[' + s + '(\'_super\'|"_super")' + s + '\\]' +
    ')');
    return regex.test(this.toString());
};

Function.classProperties = function(klass) {
    if (typeof klass != 'function') return {};
    var properties = {}, skip, prop;
    for (var method in klass) {
        skip = false;
        for (prop in JS.Class.ify(function(){}))
            if (method == prop) skip = true;
        if (method == 'bindMethods') skip = true;
        if (skip) continue;
        properties[method] = klass[method];
    }
    return properties;
};

Array.from = function(iterable) {
    if (!iterable) return [];
    if (iterable.toArray) return iterable.toArray();
    var length = iterable.length, results = new Array(length);
    while (length--) results[length] = iterable[length];
    return results;
};
