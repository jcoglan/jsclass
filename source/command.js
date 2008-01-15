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
        this._counter = 0;
      },
      
      push: function(command) {
        this._stack.splice(this._counter, this._stack.length);
        this._stack.push(command);
        this._counter = this._stack.length;
        if (this._counter == 1 && this._redo && this._redo.execute)
          this._redo.execute();
      },
      
      stepTo: function(position) {
        if (position < 0 || position > this._stack.length) return;
        var i, n;
        
        switch (true) {
          case position > this._counter :
            for (i = this._counter, n = position; i < n; i++)
              this._stack[i].execute(false);
            break;
          
          case position < this._counter :
            if (this._redo && this._redo.execute) {
              this._redo.execute();
              for (i = 0, n = position; i < n; i++)
                this._stack[i].execute(false);
            } else {
              for (i = 0, n = this._counter - position; i < n; i++)
                this._stack[this._counter - i - 1].undo();
            }
            break;
        }
        this._counter = position;
      },
      
      undo: function() {
        this.stepTo(this._counter - 1);
      },
      
      redo: function() {
        this.stepTo(this._counter + 1);
      }
    })
  }
});
