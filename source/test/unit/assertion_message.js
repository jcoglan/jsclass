JS.Test.Unit.extend({
  AssertionMessage: new JS.Class({
    extend: {
      Literal: new JS.Class({
        initialize: function(value) {
          this._value = value;
          this.toString = this.inspect;
        },
        
        inspect: function() {
          return this._value.toString();
        }
      }),
      
      literal: function(value) {
        return new this.Literal(value);
      },
      
      Template: new JS.Class({
        extend: {
          create: function(string) {
            var parts = string ? string.match(/\(\?\)|(?=[^\\])\?|(?:(?!\(\?\))(?:\\\?|[^\?]))+/g) : [];
            return new this(parts);
          }
        },
        
        initialize: function(parts) {
          this._parts = new JS.Enumerable.Collection(parts);
          this.count = this._parts.findAll(function(e) { return e === '?' || e === '(?)' }).length;
        },
        
        result: function(parameters) {
          if (parameters.length !== this.count) throw 'The number of parameters does not match the number of substitutions';
          var params = JS.array(parameters);
          return this._parts.collect(function(e) {
            if (e === '(?)') return params.shift().replace(/^\[/, '(').replace(/\]$/, ')');
            if (e === '?') return params.shift();
            return e.replace(/\\\?/g, '?');
          }).join('');
        }
      })
    },
    
    initialize: function(head, template, parameters) {
      this._head = head;
      this._templateString = template;
      this._parameters = new JS.Enumerable.Collection(parameters);
    },
    
    template: function() {
      return this._template = this._template || this.klass.Template.create(this._templateString);
    },
    
    toString: function() {
      var messageParts = [], head, tail;
      if (this._head) messageParts.push(this._head);
      tail = this.template().result(this._parameters.collect(function(e) {
        return JS.Console.convert(e);
      }, this));
      if (tail !== '') messageParts.push(tail);
      return messageParts.join('\n');
    }
  })
});

