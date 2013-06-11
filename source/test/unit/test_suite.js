Test.Unit.extend({
  TestSuite: new JS.Class({
    include: Enumerable,

    extend: {
      STARTED:  'Test.Unit.TestSuite.STARTED',
      FINISHED: 'Test.Unit.TestSuite.FINISHED',

      forEach: function(tests, block, continuation, context) {
        var looping    = false,
            pinged     = false,
            n          = tests.length,
            i          = -1,
            breakTime  = new JS.Date().getTime(),
            setTimeout = Test.FakeClock.REAL.setTimeout;

        var ping = function() {
          pinged = true;
          var time = new JS.Date().getTime();

          if (Console.BROWSER && (time - breakTime) > 1000) {
            breakTime = time;
            looping = false;
            setTimeout(iterate, 0);
          }
          else if (!looping) {
            looping = true;
            while (looping) iterate();
          }
        };

        var iterate = function() {
          i += 1;
          if (i === n) {
            looping = false;
            return continuation && continuation.call(context);
          }
          pinged = false;
          block.call(context, tests[i], ping);
          if (!pinged) looping = false;
        };

        ping();
      }
    },

    initialize: function(metadata, tests) {
      this._metadata = metadata;
      this._tests    = tests;
    },

    forEach: function(block, continuation, context) {
      this.klass.forEach(this._tests, block, continuation, context);
    },

    run: function(result, continuation, callback, context) {
      if (this._metadata.fullName)
        callback.call(context, this.klass.STARTED, this);

      this.forEach(function(test, resume) {
        test.run(result, resume, callback, context)

      }, function() {
        if (this._metadata.fullName)
          callback.call(context, this.klass.FINISHED, this);

        continuation.call(context);

      }, this);
    },

    size: function() {
      if (this._size !== undefined) return this._size;
      var totalSize = 0, i = this._tests.length;
      while (i--) totalSize += this._tests[i].size();
      return this._size = totalSize;
    },

    empty: function() {
      return this._tests.length === 0;
    },

    metadata: function(root) {
      var data = JS.extend({size: this.size()}, this._metadata);
      if (root) {
        delete data.fullName;
        delete data.shortName;
        delete data.context;
      }
      return data;
    }
  })
});

