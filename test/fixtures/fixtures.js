//================================================================
// Test that method inheritance works as it does in Ruby.
// See module.rb for equivalent Ruby code
//================================================================

var ModA = new JS.Module({
    include: {/** JS.StackTrace **/},
    speak: function() {
        return "speak() in ModA";
    },
    extend: {
        included: function(mod) {
            this.incs = this.incs || [];
            this.incs.push(mod);
        },
        
        extended: function(mod) {
            this.exts = this.exts || [];
            this.exts.push(mod);
        }
    }
});

var ModB = new JS.Module({
    speak: function() {
        return "speak() in ModB, " + this.callSuper();
    }
});

var ModC = new JS.Module();
ModC.include({
    include: [ModA, {/** JS.StackTrace **/}],
    speak: function() {
        return this.callSuper() + ", and in ModC";
    }
});
ModC.include(ModB);
ModC.included = ModA.included;

var ModD = new JS.Module({
    include: ModA,
    speak: function() {
        return "speak() in ModD, " + this.callSuper();
    }
});

var InheritanceTester = new JS.Class({
    include: [ModD, ModC, {/** JS.StackTrace **/}],
    
    initialize: function() { this.speak() },
    
    speak: function() {
        return this.callSuper() + ", and in class Foo";
    },
    
    extend: {
        children: [],
        inherited: function(klass) {
            this.children.push(klass);
        }
    }
});

var SingletonMethodTester = new JS.Class({
    speak: function() {
        return "speak() in class Bar";
    }
});

var SpecialClass = new JS.Class(JS.Class, {
    make: function(name, func) {
        return [name, this.callSuper()];
    }
});

var Special = new SpecialClass({});

var SpecialSub = new SpecialClass(InheritanceTester, {
    speak: function() {
        return this.callSuper().toUpperCase();
    }
});

var HookTesterParent = new JS.Class(InheritanceTester);
var HookTester = new JS.Class(HookTesterParent);

var Foo = new JS.Class({
    talk: function() {
        return 'talk';
    }
});

var Bar = new JS.Class(Foo, {
    talk: function() {
        return this.callSuper() + this.callSuper();
    }
});

ExtendingModule = new JS.Module({
    someMethod: function() {
        return 'I am working'
    },
    extend: {
        included: function(base) {
            base.extend(this);
        }
    }
});

ClassAsMixin = new JS.Class({
    extend: {
        aClassMethod: function() {
            return 'class'
        }
    },
    
    anInstanceMethod: function() {
        return 'instance'
    }
});

MixesInAClass = new JS.Class({
    include: ClassAsMixin,
    
    anInstanceMethod: function() {
        return this.callSuper().substring(0,4)
    }
});

ToStringTest = new JS.Class({
    toString: function() {
        return 'nothing to see'
    },
    
    __tos__: true
});

//================================================================
//================================================================

var BigNest = new JS.Class('BigNest', {
    extend: {
        A: new JS.Module({
            extend: {
                E: new JS.Class({}),
                foo: function() {}
            },
            B: new JS.Class({
                foo: function() {}
            }),
            foo: function() {}
        }),
        foo: function() {}
    },
    foo: function() {},
    
    C: new JS.Module({
        extend: {
            D: new JS.Class({
                foo: function() {}
            }),
            K: new JS.Module({
                L: new JS.Module({
                    extend: {
                        M: new JS.Module({
                            N: new JS.Module()
                        })
                    }
                })
            })
        },
        foo: function() {}
    })
});

//================================================================
//================================================================

var Animal = new JS.Class({
    extend: {
        find: function(thing) { return 'Animal finds ' + thing; },
        create: function(thing) { return this.find(thing) + ' and Animal creates ' + thing; }
    },
    initialize: function(name) {
        this.name = String(name);
    },
    speak: function(stuff) {
        return 'My name is ' + this.name + ' and I like ' + stuff;
    }
});

var Bear = new JS.Class(Animal, {
    extend: {
        create: function(thing) {
            return this.callSuper(thing) + ', but Bear creates other stuff'
        }
    },
    speak: function(stuff) {
        return this.callSuper(stuff).toUpperCase();
    }
});

var NoSuperBear = new JS.Class(Bear, {
    speak: function() { return this.name.toUpperCase(); }
});

var Koala = new JS.Class(Bear, {
    speak: function(stuff) {
        return "I'm not really a Bear, but I do like " + stuff;
    }
});

var Dog = new JS.Class(Animal, {
    bark: function() { return this.name + ' says WOOF!'; }
});

Dog.Interface = new JS.Interface(['speak', 'bark']);

var Pitbull = new JS.Class(Dog, {
    extend: {
        canBiteYourLegsOff: function() {
            return this.biting;
        },
        biting: 'Of course it can'
    },
    speak: function() {
        return this.callSuper();
    }
});

var Camel = new JS.Singleton(Animal, {
    fillHumpsWithWater: function() {}
});

//================================================================
// Let's implement the classes from here: http://www.ajaxpath.com/javascript-inheritance
// and make sure Crockford's problems aren't encountered.
//================================================================

var BaseClass = new JS.Class({
    getName: function() { return 'BaseClass(' + this.getId() + ')'; },
    getId: function() { return 1; }
});

var SubClass = new JS.Class(BaseClass, {
    getName: function() {
        return 'SubClass(' + this.getId() + ') extends ' + this.callSuper();
    },
    getId: function() { return 2; }
});

var TopClass = new JS.Class(SubClass, {
    getName: function() {
        return 'TopClass(' + this.getId() + ') extends ' + this.callSuper();
    },
    getId: function() {
        return this.callSuper();
    }
});

//================================================================
//================================================================

var NativeClass = function() {};
NativeClass.prototype = {
    getName: function() { return 'Native'; }
};

var ChildOfNativeClass = new JS.Class(NativeClass, {
    getName: function() {
        return this.callSuper();
    }
});

//================================================================
//================================================================

var Paginator = new JS.Class({
    initialize: function(n) {
        this.count = n;
        this.createItems(n);
    },
    createItems: function(n) {
        this.items = this.items || [];
        for (var i = 0; i < n; i++)
            this.items.push(new this.klass.Item(i));
    }
});

Paginator.extend({Item: new JS.Class({
    initialize: function(n) {
        this.name = 'Item';
        this.number = n;
    },
    getName: function() {
        return this.name + ' ' + this.getNumber();
    },
    getNumber: function() {
        return this.number;
    }
}) });

var Gallery = new JS.Class(Paginator, {
    createItems: function(n) { this.callSuper(4 * n); }
});

var ItemInheritor = new JS.Class(Gallery);
ItemInheritor.Item = new JS.Class(Gallery.Item, {
    getNumber: function() { return this.callSuper() + 7; }
});

//================================================================
//================================================================

var Enum = new JS.Module({
    each: function() {},
    some: function() {},
    
    extend: {
        included: function() {
            this.hasBeenIncluded = this.hasBeenIncluded || 0;
            this.hasBeenIncluded++;
        }
    }
});

var ActiveRecord = new JS.Module({
    include: Enum,
    
    save: function() {},
    validate: function() {},
    attributes: function() {},
    
    extend: {
        included: function(base) {
            base.extend({
                find: function() {},
                create: function() {}
            });
        }
    }
});

var BlankClass = new JS.Class();
BlankClass.include(ActiveRecord);

//================================================================
//================================================================

HashCar = new JS.Class({
    initialize: function(brand) {
        this.brand = brand;
    },
    
    equals: function(car) {
        return car.brand.toLowerCase() === this.brand.toLowerCase();
    },
    
    hash: function() {
        return this.brand.toLowerCase();
    }
});

HashColor = new JS.Class({
    initialize: function(code) {
        this.code = code;
    },
    
    equals: function(color) {
        return color.code === this.code;
    },
    
    hash: function() {
        return this.code;
    }
});

//================================================================
//================================================================

// A 'comparable' class whose instances can be compared and sorted
var TodoItem = new JS.Class({
    include: JS.Comparable,
    
    initialize: function(position, task) {
        this.position = position;
        this.task = task || "";
    },
    
    compareTo: function(other) {
        if (this.position < other.position)
            return -1;
        else if (this.position > other.position)
            return 1;
        else
            return 0;
    }
});

var Collection = new JS.Class({
    include: JS.Enumerable,
    initialize: function() {
      this.length = arguments.length;
      this._list = [];
      for (var i = 0, n = this.length; i < n; i++)
        this._list.push(arguments[i]);
    },
    forEach: function(block, context) {
      for (var i = 0, n = this._list.length; i < n; i++)
        block.call(context || null, this._list[i]);
    }
});

var PairedHash = new JS.Class({
    include: JS.Enumerable,
    initialize: function(object) {
        this._object = object || {};
    },
    forEach: function(block, context) {
        for (var key in this._object) {
            if (this._object.hasOwnProperty(key))
                block.call(context || null, {key: key, value: this._object[key]});
        }
    }
});

var KeyValueHash = new JS.Class({
    include: JS.Enumerable,
    initialize: function(object) {
        this._object = object || {};
    },
    forEach: function(block, context) {
        for (var key in this._object) {
            if (this._object.hasOwnProperty(key))
                block.call(context || null, key, this._object[key]);
        }
    },
    keys: function() {
        return this.map(function(key, value) { return key; });
    },
    values: function() {
        return this.collect(function(key, value) { return value; });
    }
});

var StringWrapper = new JS.Class({
    initialize: function(value) {
        this._value = value;
    },
    
    compareTo: function(object) {
        var a = this._value, b = object._value;
        return a < b ? -1 : (a > b ? 1 : 0);
    },
    
    succ: function() {
        return new this.klass(JS.Range.succ(this._value));
    }
});

//================================================================
//================================================================

var Publisher = new JS.Class({
    include: JS.Observable
});

//================================================================
//================================================================

var Bicycle = new JS.Class({
    initialize: function(model, gears) {
        this.model = model;
        this.gears = gears;
    },
    getModel: function() {
        return this.model;
    },
    getPrice: function() {
        return 10 * this.gears;
    }
});

var HeadlightDecorator = new JS.Decorator(Bicycle, {
    getPrice: function() {
        return 5 + this.component.getPrice();
    }
});

var PedalsDecorator = new JS.Decorator(Bicycle, {
    getPrice: function() {
        return 24 + this.component.getPrice();
    },
    rotatePedals: function() {
        return 'Turning the pedals';
    }
});

//================================================================
//================================================================

var Fiddler = new JS.Class({
    include: JS.State,
    
    initialize: function() {
        this.count = 0;
        this.setState('optimism');
    },
    
    getCount: function() { return this.count; },
    
    states: {
        optimism: {
            stepForward: function() {
                this.count += 2;
            },
            laughOutLoud: function() {
                return 'Ha-ha!'
            }
        },
        pessimism: {
            stepForward: function() {
                this.count -= 1;
            }
        }
    }
});

var DecoratedFiddler = new JS.Decorator(Fiddler, {
    stepForward: function() {
        this.component.stepForward();
        this.component.count += 100;
    },
    laughOutLoud: function() {
        var result = this.component.laughOutLoud();
        return (typeof result == 'string') ? result.toUpperCase() : 'WRONG';
    },
    count: function() {
        return this.component.count;
    }
});

var ProxiedFiddler = new JS.Proxy.Virtual(Fiddler);

var InheritableStateMachine = new JS.Class({
    include: JS.State,
    
    initialize: function() {
        this.setState('doggies');
        this.name = 'Alice';
    },
    
    states: {
        ponies: {
            speak: function() { return this.name + ' likes ponies!' }
        },
        doggies: {
            speak: function() { return 'doggies!' }
        }
    }
});

var ChildStateMachine = new JS.Class(InheritableStateMachine, {
    states: {
        doggies: {
            speak: function() {
                return this.callSuper() + " aren't they cute?";
            }
        },
        
        poundingTechnoMusic: {
            speak: function() {
                return 'Do you know where your children are?';
            }
        }
    }
});

var AnotherChildStateMachine = new JS.Class(ChildStateMachine, {
    initialize: function() {
        this.name = 'Jenny';
    },
    states: {
        ponies: {
            speak: function() {
                return this.callSuper() + " aren't they cute?";
            }
        }
    }
});


var TopState = new JS.Class({
    include: JS.State,

    initialize: function() {
        this.setState('CREATED');
    },

    states: {
        CREATED: {
            setup: function() {
                this.setState('READY');
                return 'Ready!';
        }   },
        
        READY: {
            say: function() {
                return 'Hello';
    }   }   }
});

var StateMixin = new JS.Module({
    states: {
        CREATED: {
            setup: function() {
                return 'Running setup from StateMixin. ' + this.callSuper();
            },
            
            say: function() {
                return 'Hunh?';
    }   }   }
});

window.console && console.log('now');

var LowerState = new JS.Class(TopState, {
    include: StateMixin,

    initialize: function() {
        this.callSuper();
    },
    
    states: {}
});

//================================================================
//================================================================

var Forwarder = new JS.Class({
    extend: JS.Forwardable,
    initialize: function() {
        this.fiddler = new Fiddler;
    }
});
Forwarder.defineDelegator('fiddler', 'getCount', 'count');
Forwarder.defineDelegators('fiddler', 'setState', 'stepForward');

//================================================================
//================================================================

var Rails = new JS.Class();
var RailsModule = new JS.Module({
    setValue: function(value) {
        this.numericValue = value;
    }
});

ENV = this;
JS.Ruby(Rails, function() { with(this) {
    
    include(JS.Observable);
    extend(JS.Forwardable);
    
    // test DSL extension
    extend(RailsModule);
    with (self) {
        alias('myValueIs', 'setValue');
    }
    myValueIs(27);
    
    def('initialize', function() {
        this.attributes = {};
    });
    
    def('updateAttributes', function(attrs) {
        for (var key in attrs)
            this.attributes[key] = attrs[key];
        this.notifyObservers(this);
    });
    
    defineDelegator('attributes', 'name', 'getName');
    alias('itsName', 'getName');
    
    with (self) {
        def('create', function(attrs) {
            var rails = new this;
            rails.updateAttributes(attrs || {});
            return rails;
        });
        
        alias('make', 'create');
    }
    
    var r = make({name: 'Rails instance'});
    ENV.console && console.log(instanceMethod('updateAttributes').toString());
    ENV.console && console.log(r.itsName());
}});

window.console && console.log(Rails.numericValue);

// Let's be evil
Object.prototype.nothing = function() {};

