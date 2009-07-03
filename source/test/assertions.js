JS.Test.Unit.extend({
  Assertions: new JS.Module({
    assertBlock: function(message, block, context) {
      this._wrapAssertion(function() {
        if (!block.call(context || null))
          throw new JS.Test.Unit.AssertionFailedError(message || 'assertBlock failed.');
      });
    },
    
    assert: function(bool, message) {
      this._assertionWrapped = true;    // TODO remove this line
      this._wrapAssertion(function() {
        this.assertBlock(this.buildMessage(message, "<?> is not true.", bool),
                         function() { return bool });
      });
    },
    
    buildMessage: function() {
      var args     = JS.array(arguments),
          head     = args.shift(),
          template = args.shift();
      return new JS.Test.Unit.Assertions.AssertionMessage(head, template, args);
    },
    
    _wrapAssertion: function(block) {
      if (this._assertionWrapped === undefined) this._assertionWrapped = false;
      if (!this._assertionWrapped) {
        this._assertionWrapped = true;
        try {
          this.addAssertion();
          return block.call(this);
        } catch (e) {
        } finally {
          this._assertionWrapped = false;
        }
      } else {
        return block.call(this);
      }
    },
    
    _addAssertion: function() {},
    
    extend: {
      AssertionMessage: new JS.Class({
        extend: {
          Template: new JS.Class({
            extend: {
              create: function(string) {
                var parts = string ? string.match(/(?=[^\\])\?|(?:\\\?|[^\?])+/g) : [];
                return new this(parts);
              }
            },
            
            initialize: function(parts) {
              this._parts = new JS.Enumerable.Collection(parts);
              this.count = this._parts.findAll(function(e) { return e === '?' }).length;
            },
            
            result: function(parameters) {
              if (parameters.length !== this.count) throw "The number of parameters does not match the number of substitutions.";
              var params = JS.array(parameters);
              return this._parts.collect(function(e) {
                return e === '?' ? params.shift() : e.replace(/\\\?/g, '?');
              }).join('');
            }
          })
        },
        
        initialize: function(head, template, parameters) {
          this._head = head;
          this._templateString = template;
          this._parameters = new JS.Enumerable.Collection(parameters);
          this.toString = this._toString;
        },
        
        convert: function(object) {
          return (object && object.toString) ? object.toString() : String(object);
        },
        
        template: function() {
          return this._template = this._template || this.klass.Template.create(this._templateString);
        },
        
        addPeriod: function(string) {
          return /\.$/.test(string) ? string : string + '.';
        },
        
        _toString: function() {
          var messageParts = [], head, tail;
          if (this._head) {
            head = this.convert(this._head);
            if (head !== '') messageParts.push(this.addPeriod(head));
          }
          tail = this.template().result(this._parameters.collect(function(e) {
            return this.convert(e);
          }, this));
          if (tail !== '') messageParts.push(tail);
          return messageParts.join("\n");
        }
      })
    }
  })
});

