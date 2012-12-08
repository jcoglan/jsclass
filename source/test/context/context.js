JS.Test.extend({
  Context: new JS.Module({
    extend: {
      included: function(base) {
        base.extend(JS.Test.Context.Context, {_resolve: false});
        base.include(JS.Test.Context.LifeCycle, {_resolve: false});
        base.extend(JS.Test.Context.Test, {_resolve: false});
        base.include(JS.Console);
      },

      Context: new JS.Module({
        getContextName: function() {
          this._contextName = this._contextName || '';
          return (typeof this.superclass.getContextName === 'function')
            ? (this.superclass.getContextName() + ' ' + this._contextName).replace(/^\s+/, '')
            : this.displayName;
        },

        setContextName: function(name) {
          this._contextName = name;
        },

        context: function(name, block) {
          var klass = new JS.Class(this, {}, {_resolve: false});
          klass.__eigen__().resolve();

          klass.setContextName(name.toString());
          klass.setName(klass.getContextName());

          block.call(klass);
          return klass;
        },

        cover: function(module) {
          var logger = new JS.Test.Coverage(module);
          this.before_all_callbacks.push(logger.method('attach'));
          this.after_all_callbacks.push(logger.method('detach'));
          JS.Test.Unit.TestCase.reports.push(logger);
        }
      })
    }
  }),

  describe: function(name, block) {
    var klass = new JS.Class(name.toString(), JS.Test.Unit.TestCase, {}, {_resolve: false});
    klass.include(JS.Test.Context, {_resolve: false});
    klass.__eigen__().resolve();

    block.call(klass);
    return klass;
  }
});

JS.Test.Context.Context.alias({describe: 'context'});

JS.Test.extend({
  context:  JS.Test.describe
});

