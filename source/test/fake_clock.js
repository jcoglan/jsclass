Test.extend({
  FakeClock: new JS.Module({
    extend: {
      API: new JS.Singleton({
        METHODS: ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],

        stub: function() {
          var mocking = Test.Mocking,
              methods = this.METHODS,
              i       = methods.length;

          Test.FakeClock.reset();

          while (i--) {
            if (methods[i] === 'Date')
              mocking.stub('new', methods[i], Test.FakeClock.method(methods[i]));
            else
              mocking.stub(methods[i], Test.FakeClock.method(methods[i]));
          }

          Date.now = Test.FakeClock.REAL.Date.now;
        },

        reset: function() {
          return Test.FakeClock.reset();
        },

        tick: function(milliseconds) {
          return Test.FakeClock.tick(milliseconds);
        }
      }),

      REAL: {},

      Schedule: new JS.Class(SortedSet, {
        nextScheduledAt: function(time) {
          return this.find(function(timeout) { return timeout.time <= time });
        }
      }),

      Timeout: new JS.Class({
        include: Comparable,

        initialize: function(callback, interval, repeat) {
          this.callback = callback;
          this.interval = interval;
          this.repeat   = repeat;
        },

        compareTo: function(other) {
          return this.time - other.time;
        },

        toString: function() {
          return (this.repeat ? 'Interval' : 'Timeout') +
                '(' + this.interval + ')' +
                ':' + this.time;
        }
      }),

      reset: function() {
        this._currentTime = new Date().getTime();
        this._callTime    = this._currentTime;
        this._schedule    = new this.Schedule();
      },

      tick: function(milliseconds) {
        this._currentTime += milliseconds;
        var timeout;
        while (timeout = this._schedule.nextScheduledAt(this._currentTime))
          this._run(timeout);
        this._callTime = this._currentTime;
      },

      _run: function(timeout) {
        this._callTime = timeout.time;
        timeout.callback();

        if (timeout.repeat) {
          timeout.time += timeout.interval;
          this._schedule.rebuild();
        } else {
          this.clearTimeout(timeout);
        }
      },

      _timer: function(callback, milliseconds, repeat) {
        var timeout = new this.Timeout(callback, milliseconds, repeat);
        timeout.time = this._callTime + milliseconds;
        this._schedule.add(timeout);
        return timeout;
      },

      Date: function() {
        var date = new Test.FakeClock.REAL.Date();
        date.setTime(this._callTime);
        return date;
      },

      setTimeout: function(callback, milliseconds) {
        return this._timer(callback, milliseconds, false);
      },

      setInterval: function(callback, milliseconds) {
        return this._timer(callback, milliseconds, true);
      },

      clearTimeout: function(timeout) {
        this._schedule.remove(timeout)
      },

      clearInterval: function(timeout) {
        this._schedule.remove(timeout);
      }
    }
  })
});

Test.FakeClock.include({
  clock: Test.FakeClock.API
});

(function() {
  var methods = Test.FakeClock.API.METHODS,
      i       = methods.length;

  while (i--) Test.FakeClock.REAL[methods[i]] = JS.ENV[methods[i]];
})();

