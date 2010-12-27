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
      
      reset: function() {
        this._currentTime = 0;
        this._callTime    = 0;
        this._timeouts    = [];
      },
      
      tick: function(milliseconds) {
        this._currentTime += milliseconds;
        
        var timeouts = this._timeouts,
            i        = timeouts.length,
            timeout;
        
        while (i--) {
          timeout = timeouts[i];
          if (timeout.time > this._currentTime) continue;
          this._run(timeout, i);
        }
      },
      
      _run: function(timeout, i) {
        if (timeout.time > this._currentTime) return;
        if (timeout.repeat) {
          while (timeout.time <= this._currentTime) {
            this._callTime = timeout.time;
            timeout.callback();
            timeout.time += timeout.interval;
          }
        } else {
          this._callTime = timeout.time;
          timeout.callback();
          if (typeof i === 'number') this._timeouts.splice(i, 1);
        }
      },
      
      _schedule: function(timeout) {
        if (timeout.time <= this._currentTime && !timeout.repeat) return;
        this._timeouts.splice(0, 0, timeout);
      },
      
      _timer: function(callback, milliseconds, repeat) {
        var timeout = {
          callback: callback,
          time:     this._callTime + milliseconds,
          interval: milliseconds,
          repeat:   repeat
        };
        this._run(timeout);
        this._schedule(timeout);
        return timeout;
      },
      
      setTimeout: function(callback, milliseconds) {
        return this._timer(callback, milliseconds, false);
      },
      
      setInterval: function(callback, milliseconds) {
        return this._timer(callback, milliseconds, true);
      },
      
      clearTimeout: function(timeout) {
        var timeouts = this._timeouts,
            i        = timeouts.length;
        
        while (i--) {
          if (timeouts[i] === timeout)
            timeouts.splice(i, 1);
        }
      },
      
      clearInterval: function(timeout) {
        return this.clearTimeout(timeout);
      }
    }
  })
});

JS.Test.Mocking.Clock.include({
  clock: JS.Test.Mocking.Clock.API
});

