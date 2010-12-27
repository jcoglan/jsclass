JS.Test.Mocking.extend({
  Clock: new JS.Module({
    extend: {
      API: {
        stub: function() {
          var mocking = JS.Test.Mocking,
              env     = JS.Package.ENV,
              methods = ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
              i       = methods.length;
          
          while (i--) {
            mocking.stub(env, methods[i], mocking.Clock.method(methods[i]));
          }
          mocking.Clock.reset();
        },
        
        reset: function() {
          return JS.Test.Mocking.Clock.reset();
        },
        
        tick: function(milliseconds) {
          return JS.Test.Mocking.Clock.tick(milliseconds);
        }
      },
      
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
        this._currentTime = 0;
        this._callTime    = 0;
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

JS.Test.Mocking.Clock.include({
  clock: JS.Test.Mocking.Clock.API
});

