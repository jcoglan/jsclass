Test.extend({
  Context: new JS.Module({
    extend: {
      included: function(base) {
        base.extend(Test.Context.Context, {_resolve: false});
        base.include(Test.Context.LifeCycle, {_resolve: false});
        base.extend(Test.Context.Test, {_resolve: false});
        base.include(Console);
      },

      Context: new JS.Module({
        context: function(name, block) {
          var klass = new JS.Class(name.toString(), this, {}, {_resolve: false});
          klass.__eigen__().resolve();
          block.call(klass);
          return klass;
        },

        cover: function(module) {
          var logger = new Test.Coverage(module);
          this.before_all_callbacks.push(logger.method('attach'));
          this.after_all_callbacks.push(logger.method('detach'));
          Test.Unit.TestCase.reports.push(logger);
        }
      })
    }
  }),

  describe: function(name, block) {
    var klass = new JS.Class(name.toString(), Test.Unit.TestCase, {}, {_resolve: false});
    klass.include(Test.Context, {_resolve: false});
    klass.__eigen__().resolve();

    block.call(klass);
    return klass;
  }
});

Test.Context.Context.alias({describe: 'context'});

Test.extend({
  context:  Test.describe
});

