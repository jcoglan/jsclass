JS.Test.extend({
  FakeClock: new JS.Module({
    extend: {
      API: {
        stub: function() {
          var mocking = JS.Test.Mocking,
              env     = JS.ENV,
              methods = ['Date', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
              i       = methods.length;
          
          JS.Test.FakeClock.reset();
          
          while (i--)
            mocking.stub(env, methods[i], JS.Test.FakeClock.method(methods[i]));
        },
        
        reset: function() {
          return JS.Test.FakeClock.reset();
        },
        
        tick: function(milliseconds) {
          return JS.Test.FakeClock.tick(milliseconds);
        }
      },
      
      JSDate: Date,
      
      Schedule: new JS.Class(JS.SortedSet, {
        nextScheduledAt: function(time) {
          return this.find(function(timeout) { return timeout.time <= time });
        }
      }),
      
      Timeout: new JS.Class({
        include: JS.Comparable,
        
        initialize: function(callback, interval, repeat) {
          this.callback = callback;
          this.interval = interval;
          this.repeat   = repeat;
        },
        
        compareTo: function(other) {
          return this.time - other.time;
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
        var date = new this.JSDate();
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

JS.Test.FakeClock.include({
  clock: JS.Test.FakeClock.API
});

