JS.Test.Reporters.extend({
  Browser: new JS.Class({
    _contextFor: function(test) {
      var context = this._context,
          scopes  = test.context;
      
      for (var i = 0, n = scopes.length; i < n; i++)
        context = context.child(scopes[i]);
      
      return context;
    },
    
    startRun: function(event) {
      var self = this;
      if (this._container) document.body.removeChild(this._container);
      
      this._container = JS.DOM.div({className: 'test-result-container'}, function(div) {
        div.table({className: 'report'}, function(table) {
          table.thead(function(thead) {
            thead.tr(function(tr) {
              tr.th({scope: 'col'}, 'Tests');
              tr.th({scope: 'col'}, 'Assertions');
              tr.th({scope: 'col'}, 'Failures');
              tr.th({scope: 'col'}, 'Errors');
            });
          });
          table.tbody(function(tbody) {
            tbody.tr(function(tr) {
              self._tests      = tr.td();
              self._assertions = tr.td();
              self._failures   = tr.td();
              self._errors     = tr.td();
            });
          });
        });
        self._light = div.div({className: 'light light-pending'});
        div.p({className: 'user-agent'}, window.navigator.userAgent);
        self._context = new self.klass.Context('spec', div.ul({className: 'specs'}));
        self._summary = div.p({className: 'summary'});
      });
      
      document.body.insertBefore(this._container, document.body.firstChild);
      this.update({tests: 0, assertions: 0, failures: 0, errors: 0});
    },
    
    startSuite: function(event) {},
    
    startTest: function(event) {
      this._contextFor(event).addTest(event.shortName);
    },
    
    addFault: function(event) {
      this._contextFor(event.test).child(event.test.shortName).addFault(event.error);
    },
    
    endTest: function(event) {},
    
    endSuite: function(event) {},
    
    update: function(event) {
      this._tests.innerHTML      = String(event.tests);
      this._assertions.innerHTML = String(event.assertions);
      this._failures.innerHTML   = String(event.failures);
      this._errors.innerHTML     = String(event.errors);
    },
    
    endRun: function(event) {
      this.update(event);
      JS.DOM.removeClass(this._light, 'light-pending');
      JS.DOM.addClass(this._light, event.passed ? 'light-passed' : 'light-failed');
      this._summary.innerHTML = 'Finished in ' + event.runtime + ' seconds';
    },
    
    serialize: function() {
      var items = document.getElementsByTagName('li'),
          n     = items.length;
      while (n--) JS.DOM.removeClass(items[n], 'closed');
      
      var items = document.getElementsByTagName('script'),
          n     = items.length;
      while (n--) items[n].parentNode.removeChild(items[n]);
      
      var html = document.getElementsByTagName('html')[0];
      return '<!doctype html><html>' + html.innerHTML + '</html>';
    }
  })
});

JS.Test.Reporters.Browser.extend({
  Context: new JS.Class({
    initialize: function(type, parent, name) {
      this._parent   = parent;
      this._type     = type;
      this._name     = name;
      this._children = [];
      
      if (name === undefined) {
        this._ul = parent;
        return;
      }
      
      var container = this._parent._ul || this._parent,
          fields    = {_tests: 'Tests', _failures: 'Failed'},
          self      = this;
      
      this._li = new JS.DOM.Builder(container).li({className: this._type + ' passed'}, function(li) {
        li.ul({className: 'stats'}, function(ul) {
          for (var key in fields)
            ul.li(function(li) {
              li.span({className: 'label'}, fields[key] + ': ');
              self[key] = li.span({className: 'number'}, '0');
            });
        });
        if (name) {
          self._toggle = li.p({className: self._type + '-name'}, name);
          if (self._type === 'spec') {
            self._runner = JS.DOM.span({className: 'runner'}, 'Run');
            self._runner.style.background = 'url("' + JSCLASS_PATH + 'assets/bullet_go.png") center center no-repeat';
            self._toggle.insertBefore(self._runner, self._toggle.firstChild);
          }
        }
        self._ul = li.ul({className: 'children'});
      });
      
      var pattern = /\btest=/; // TODO get this from a UI abstraction
      if (!pattern.test(window.location.search))
        JS.DOM.addClass(this._li, 'closed');
      
      JS.DOM.Event.on(this._toggle, 'click', function() {
        JS.DOM.toggleClass(this._li, 'closed');
      }, this);
      
      if (this._runner)
        JS.DOM.Event.on(this._runner, 'click', this.runTest, this);
    },
    
    ping: function(field) {
      if (!this[field]) return;
      this[field].innerHTML = parseInt(this[field].innerHTML) + 1;
      if (this._parent.ping) this._parent.ping(field);
    },
    
    fail: function() {
      if (!this._li) return;
      JS.DOM.removeClass(this._li, 'passed');
      JS.DOM.addClass(this._toggle, 'failed');
      if (this._parent.fail) this._parent.fail();
    },
    
    child: function(name) {
      return this._children[name] = this._children[name] ||
                                    new this.klass('spec', this, name);
    },
    
    addTest: function(name) {
      var test = this._children[name] = new this.klass('test', this, name);
      test.ping('_tests');
    },
    
    addFault: function(fault) {
      var message = fault.message;
      if (fault.backtrace) message += '\n' + fault.backtrace;
      
      var item = JS.DOM.li({className: 'fault'}, function(li) {
        li.p(function(p) {
          var parts = message.split(/[\r\n]+/);
          for (var i = 0, n = parts.length; i < n; i++) {
            if (i > 0) p.br();
            p.concat(parts[i]);
          }
        });
      });
      this._ul.appendChild(item);
      this.ping('_failures');
      this.fail();
    },
    
    getName: function() {
      var parts  = [],
          parent = this._parent && this._parent.getName && this._parent.getName();
      
      if (parent) parts.push(parent);
      parts.push(this._name);
      return parts.join(' ');
    },
    
    runTest: function() {
      window.location.search = 'test=' + encodeURIComponent(this.getName());
    }
  })
});

