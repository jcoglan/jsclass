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
      
      push: function(name, object, args) {
        args = JS.Console.convert(args).replace(/^\[/, '(').replace(/\]$/, ')');
        var list = this._list, length = list.length;
        if (length === 0 || list[length-1].leaf) this.puts('');
        this.consoleFormat('bgblack', 'white');
        this.print('TRACE');
        this.reset();
        this.print(this.indent());
        this.blue();
        this.print(name);
        this.red();
        this.print(args);
        this.reset();
        if (this._list.length > 0) this._list[this._list.length - 1].leaf = false;
        this._list.push({name: name, object: object, args: args, leaf: true});
      },
      
      pop: function(result) {
        var frame = this._list.pop();
        if (frame.leaf) {
          this.consoleFormat('red');
          this.print(' --> ');
        } else {
          this.consoleFormat('bgblack', 'white');
          this.print('TRACE');
          this.reset();
          this.print(this.indent());
          this.blue();
          this.print(frame.name);
          this.red();
          this.print(' --> ');
        }
        this.consoleFormat('bold', 'yellow');
        this.puts(JS.Console.convert(result));
        this.reset();
        this.print('');
        return frame.name;
      },
      
      top: function() {
        return this._list[this._list.length - 1] || {};
      },
      
      backtrace: function() {
        var i = this._list.length, item;
        while (i--) {
          item = this._list[i];
          this.print('      | ');
          this.consoleFormat('blue');
          this.print(item.name);
          this.red();
          this.print(item.args);
          this.reset();
          this.puts(' in ');
          this.print('      |  ');
          this.bold();
          this.puts(JS.Console.convert(item.object));
        }
        this.reset();
        this.puts();
      }
    }),
    
    flush: function() {
      this.stack._list = [];
    },
    
    print: function() {
      this.stack.backtrace();
    },
    
    wrap: function(func, method, env) {
      var self     = JS.StackTrace,
          C        = JS.Console,
          name     = method.name,
          module   = method.module,
          
          fullName = C.nameOf(env) +
                     (module === env ? '' : '(' + C.nameOf(module) + ')') +
                    '#' + name;
      
      var wrapper = function() {
        var result;
        self.stack.push(fullName, this, Array.prototype.slice.call(arguments));
        
        try { result = func.apply(this, arguments) }
        catch (e) { self.handleError(e) }
        
        self.stack.pop(result);
        return result;
      };
      wrapper.toString = function() { return func.toString() };
      wrapper.__traced__ = true;
      return wrapper;
    },
    
    handleError: function(e) {
      if (e.logged) throw e;
      e.logged = true;
      
      var C = JS.Console;
      C.consoleFormat('bgred', 'white');
      C.print('ERROR');
      C.consoleFormat('bold', 'red');
      C.print(' ' + C.convert(e));
      C.reset();
      C.print(' thrown by ');
      C.bold();
      C.print(this.stack.top().name);
      C.reset();
      C.puts('. Backtrace:');
      this.print();
      this.flush();
      throw e;
    }
  }
});
