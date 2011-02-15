JS.StackTrace = new JS.Module('StackTrace', {
  extend: {
    stack: new JS.Singleton({
      include: JS.Console,
      _list: [],
      
      indent: function() {
        var indent = ' ',
            n      = this._list.length;
        
        while (n--) indent += '|   ';
        return indent;
      },
      
      push: function(name, object, args) {
        args = JS.Console.convert(args).replace(/^\[/, '(').replace(/\]$/, ')');
        this.consoleFormat('bgblack', 'white');
        this.print('TRACE');
        this.reset();
        this.print(this.indent());
        this.blue();
        this.print(name);
        this.red();
        this.puts(args);
        this.reset();
        this._list.push({name: name, object: object, args: args});
      },
      
      pop: function(result) {
        var name = this._list.pop().name;
        this.consoleFormat('bgblack', 'white');
        this.print('TRACE');
        this.reset();
        this.print(this.indent());
        this.blue();
        this.print(name);
        this.red();
        this.print('() --> ');
        this.consoleFormat('bold', 'yellow');
        this.puts(JS.Console.convert(result));
        this.reset();
        return name;
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
          this.print('      |     ');
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
    
    wrap: function(func, module, name) {
      var self = JS.StackTrace, C = JS.Console;
      var wrapper = function() {
        var result, fullName = JS.Console.nameOf(module) + '#' + name;
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
      C.consoleFormat('bold');
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
