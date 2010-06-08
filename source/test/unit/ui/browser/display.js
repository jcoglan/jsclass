JS.Test.Unit.UI.Browser.TestRunner.extend({
  Display: new JS.Class({
    extend: {
      getInstance: function() {
        return this._instance = this._instance || new this();
      },
      
      Context: new JS.Class({
        initialize: function(parent, name) {
          this._parent = parent;
          this._children = [];
          
          if (name === undefined) {
            this._ul = parent;
            return;
          }
          
          var self     = this;
          this._li = new JS.DOM.Builder(this._parent).li({className: 'closed'}, function(li) {
            if (name) self._toggle = li.span(name);
            self._ul = li.ul();
          });
          
          JS.DOM.Event.on(this._toggle, 'click', function() {
            JS.DOM.toggleClass(this._li, 'closed');
          }, this);
        },
        
        child: function(name) {
          return this._children[name] = this._children[name] ||
                                        new this.klass(this._ul, name);
        },
        
        addTest: function(name) {
          this._ul.appendChild(JS.DOM.li(function(li) { li.span(name) }));
        }
      })
    },
    
    initialize: function() {
      this._constructDOM();
      document.body.insertBefore(this._container, document.body.firstChild);
    },
    
    _constructDOM: function() {
      var self = this;
      self._container = JS.DOM.div({className: 'test-result-container'}, function(div) {
        div.h1('Test results');
        div.table({className: 'summary'}, function(table) {
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
        self._context = new self.klass.Context(div.ul({className: 'specs'}));
        self._reports = div.ul({className: 'reports'});
      });
    },
    
    setTestCount: function(n) {
      this._tests.innerHTML = String(n);
    },
    
    setAssertionCount: function(n) {
      this._assertions.innerHTML = String(n);
    },
    
    setFailureCount: function(n) {
      this._failures.innerHTML = String(n);
    },
    
    setErrorCount: function(n) {
      this._errors.innerHTML = String(n);
    },
    
    addReport: function(string) {
      var item = JS.DOM.li(function(li) {
        li.p(function(p) {
          var parts = string.split(/[\r\n]+/);
          for (var i = 0, n = parts.length; i < n; i++) {
            if (i > 0) p.br();
            p.concat(parts[i]);
          }
        });
      });
      this._reports.appendChild(item);
    },
    
    addTestCase: function(testCase) {
      var name    = testCase.name(),
          klass   = testCase.klass,
          context = klass.getContextName ? klass.getContextName() : klass.displayName,
          parents = new JS.Enumerable.Collection();
      
      name = name.replace(context, '')
                 .replace(context, '')
                 .replace(/\(.*?\)$/g, '')
                 .replace(/^test\W+/g, '');
      
      while (klass !== JS.Test.Unit.TestCase) {
        parents.push(klass);
        klass = klass.superclass;
      }
      
      var context = parents.reverseForEach().inject(this._context, function(context, klass) {
        return context.child(klass._contextName || klass.displayName);
      });
      
      context.addTest(name);
    }
  })
});

