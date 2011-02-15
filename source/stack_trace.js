JS.StackTrace = new JS.Module('StackTrace', {
  extend: {
    stack: new JS.Singleton({
      include: JS.Console,
      _list: [],
      
      indent: function() {
        var indent = ' ',
            n      = this._list.length;
        
        while (n--) indent += '|  ';
        return indent;
      },
      
      push: function(object, method, env, args) {
        var list = this._list;
        var newline = (list.length === 0 || list[list.length-1].leaf);
        
        if (list.length > 0) list[list.length - 1].leaf = false;
        
        var frame = {
          object: object,
          method: method,
          env:    env,
          args:   args,
          leaf:   true
        };
        frame.name = this.fullName(frame);
        this.logEnter(frame, newline);
        list.push(frame);
      },
      
      pop: function(result) {
        var frame = this._list.pop();
        frame.result = result;
        this.logExit(frame);
      },
      
      top: function() {
        return this._list[this._list.length - 1] || {};
      },
      
      fullName: function(frame) {
        var C        = JS.Console,
            method   = frame.method,
            env      = frame.env,
            name     = method.name,
            module   = method.module;
            
        return C.nameOf(env) +
                (module === env ? '' : '(' + C.nameOf(module) + ')') +
                '#' + name;
      },
      
      logEnter: function(frame, newline) {
        var fullName = this.fullName(frame),
            args = JS.Console.convert(frame.args).replace(/^\[/, '(').replace(/\]$/, ')');
        
        if (newline) this.puts();
        this.consoleFormat('bgblack', 'white');
        this.print('TRACE');
        this.reset();
        this.print(this.indent());
        this.blue();
        this.print(fullName);
        this.red();
        this.print(args);
        this.reset();
      },
      
      logExit: function(frame) {
        var fullName = this.fullName(frame);
        
        if (frame.leaf) {
          this.consoleFormat('red');
          this.print(' --> ');
        } else {
          this.consoleFormat('bgblack', 'white');
          this.print('TRACE');
          this.reset();
          this.print(this.indent());
          this.blue();
          this.print(fullName);
          this.red();
          this.print(' --> ');
        }
        this.consoleFormat('bold', 'yellow');
        this.puts(JS.Console.convert(frame.result));
        this.reset();
        this.print('');
      },
      
      handleError: function(e) {
        if (e.logged) throw e;
        e.logged = true;
        
        this.consoleFormat('bgred', 'white');
        this.puts();
        this.print('ERROR');
        this.consoleFormat('bold', 'red');
        this.print(' ' + JS.Console.convert(e));
        this.reset();
        this.print(' thrown by ');
        this.bold();
        this.print(this._list[this._list.length - 1].name);
        this.reset();
        this.puts('. Backtrace:');
        this.backtrace();
        this._list = [];
        throw e;
      },
      
      backtrace: function() {
        var i = this._list.length, frame, args;
        while (i--) {
          frame = this._list[i];
          args = JS.Console.convert(frame.args).replace(/^\[/, '(').replace(/\]$/, ')');
          this.print('      | ');
          this.consoleFormat('blue');
          this.print(frame.name);
          this.red();
          this.print(args);
          this.reset();
          this.puts(' in ');
          this.print('      |  ');
          this.bold();
          this.puts(JS.Console.convert(frame.object));
        }
        this.reset();
        this.puts();
      }
    }),
    
    wrap: function(func, method, env) {
      var self = JS.StackTrace;
      var wrapper = function() {
        var result;
        self.stack.push(this, method, env, Array.prototype.slice.call(arguments));
        
        try { result = func.apply(this, arguments) }
        catch (e) { self.stack.handleError(e) }
        
        self.stack.pop(result);
        return result;
      };
      wrapper.toString = function() { return func.toString() };
      wrapper.__traced__ = true;
      return wrapper;
    }
  }
});
