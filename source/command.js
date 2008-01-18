JS.Command = JS.Class({
  initialize: function(functions) {
    if (typeof functions == 'function')
      functions = {execute: functions};
    this._functions = functions;
    this._stack = this._functions.stack || null;
  },
  
  execute: function(push) {
    if (this._stack && push !== false) this._stack.push(this);
    var exec = this._functions.execute;
    if (exec) exec.apply(this);
  },
  
  undo: function() {
    var exec = this._functions.undo;
    if (exec) exec.apply(this);
  },
  
  extend: {
    Stack: JS.Class({
      initialize: function(options) {
        options = options || {};
        this._redo = options.redo || null;
        this.clear();
      },
      
      clear: function() {
        this._stack = [];
        this.length = this.pointer = 0;
      },
      
      push: function(command) {
        this._stack.splice(this.pointer, this.length);
        this._stack.push(command);
        this.length = this.pointer = this._stack.length;
        if (this.pointer == 1 && this._redo && this._redo.execute)
          this._redo.execute();
      },
      
      stepTo: function(position) {
        if (position < 0 || position > this.length) return;
        var i, n;
        
        switch (true) {
          case position > this.pointer :
            for (i = this.pointer, n = position; i < n; i++)
              this._stack[i].execute(false);
            break;
          
          case position < this.pointer :
            if (this._redo && this._redo.execute) {
              this._redo.execute();
              for (i = 0, n = position; i < n; i++)
                this._stack[i].execute(false);
            } else {
              for (i = 0, n = this.pointer - position; i < n; i++)
                this._stack[this.pointer - i - 1].undo();
            }
            break;
        }
        this.pointer = position;
      },
      
      undo: function() {
        this.stepTo(this.pointer - 1);
      },
      
      redo: function() {
        this.stepTo(this.pointer + 1);
      }
    })
  }
});
