JS.ENV.CommandSpec = JS.Test.describe(JS.Command, function() {
  before(function() {
    this.counter = 0
  })
  
  describe("with an execute() method", function() {
    before(function() {
      this.command = new JS.Command({
        execute: function() { counter += 1 }
      })
    })
    
    it("runs the commmand with execute()", function() {
      assertEqual( 0, counter )
      command.execute()
      assertEqual( 1, counter )
    })
    
    it("does nothing when undo() is called", function() {
      command.undo()
      assertEqual( 0, counter )
    })
  })
  
  describe("with execute() and undo() methods", function() {
    before(function() {
      this.command = new JS.Command({
        execute: function() { counter += 1 },
        undo:    function() { counter -= 1 }
      })
    })
    
    it("runs the commmand with execute()", function() {
      assertEqual( 0, counter )
      command.execute()
      assertEqual( 1, counter )
    })
    
    it("undoes the command with undo()", function() {
      assertEqual( 0, counter )
      command.undo()
      assertEqual( -1, counter )
    })
  })
  
  describe(JS.Command.Stack, function() {
    sharedBehavior("command stack", function() {
      describe("with no commands in the stack", function() {
        describe("#undo", function() {
          before(function() {
            stack.undo()
          })
          
          it("has no effect", function() {
            assertEqual( 0, counter )
            assertEqual( 0, stack.length )
            assertEqual( 0, stack.pointer )
          })
        })
        
        describe("#redo", function() {
          before(function() {
            stack.redo()
          })
          
          it("has no effect", function() {
            assertEqual( 0, counter )
            assertEqual( 0, stack.length )
            assertEqual( 0, stack.pointer )
          })
        })
      })
      
      describe("running a command", function() {
        before(function() {
          command.execute()
        })
        
        it("adds the command to the stack", function() {
          assertEqual( [command], stack.toArray() )
          assertEqual( 1, stack.length )
          assertEqual( 1, stack.pointer )
        })
      })
      
      describe("with a command in the stack", function() {
        before(function() {
          command.execute()
        })
        
        describe("#redo", function() {
          before(function() {
            stack.redo()
          })
          
          it("has no effect", function() {
            assertEqual( 1, counter )
            assertEqual( [command], stack.toArray() )
            assertEqual( 1, stack.length )
            assertEqual( 1, stack.pointer )
          })
        })
        
        describe("#undo", function() {
          before(function() {
            stack.undo()
          })
          
          it("undoes the command", function() {
            assertEqual( 0, counter )
          })
          
          it("leaves the command in the stack", function() {
            assertEqual( [command], stack.toArray() )
            assertEqual( 1, stack.length )
          })
          
          it("sets the stack pointer to the command's index", function() {
            assertEqual( 0, stack.pointer )
          })
          
          describe("followed by #redo", function() {
            before(function() {
              stack.redo()
            })
            
            it("re-executes the command", function() {
              assertEqual( 1, counter )
            })
            
            it("increments the stack pointer", function() {
              assertEqual( 1, stack.pointer )
            })
          })
        })
      })
      
      describe("with a few commands in the stack", function() {
        before(function() {
          command1.execute()
          command2.execute()
          command3.execute()
          assertEqual( 6, counter )
          
          this.pointerTracker = 0
          stack.subscribe(function() { pointerTracker = stack.pointer })
        })
        
        describe("executing a command", function() {
          it("notifies observers", function() {
            assertEqual( 0, pointerTracker )
            command.execute()
            assertEqual( 4, pointerTracker )
          })
        })
        
        describe("#undo", function() {
          it("undoes each command in reverse order", function() {
            stack.undo()
            assertEqual( 3, counter )
            stack.undo()
            assertEqual( 1, counter )
            stack.undo()
            assertEqual( 0, counter )
          })
          
          it("steps the stack pointer down once each time", function() {
            stack.undo()
            assertEqual( 2, stack.pointer )
            stack.undo()
            assertEqual( 1, stack.pointer )
            stack.undo()
            assertEqual( 0, stack.pointer )
          })
          
          it("leaves the stack intact", function() {
            stack.undo()
            assertEqual( [command1, command2, command3], stack.toArray() )
            assertEqual( 3, stack.length )
          })
          
          it("notifies observers", function() {
            assertEqual( 0, pointerTracker )
            stack.undo()
            assertEqual( 2, pointerTracker )
          })
        })
        
        describe("#redo", function() {
          before(function() {
            stack.undo()
            assertEqual( 3, counter )
          })
          
          it("redoes the last undone command", function() {
            stack.undo()
            assertEqual( 1, counter )
            stack.redo()
            assertEqual( 3, counter )
            stack.redo()
            assertEqual( 6, counter )
          })
          
          it("notifies observers", function() {
            assertEqual( 2, pointerTracker )
            stack.redo()
            assertEqual( 3, pointerTracker )
          })
        })
        
        describe("#stepTo", function() {
          before(function() {
            stack.stepTo(1)
          })
          
          it("jumps to the given index in the stack's history", function() {
            assertEqual( 1, counter )
          })
          
          it("sets the stack pointer to the given index", function() {
            assertEqual( 1, stack.pointer )
          })
          
          it("leaves the stack intact", function() {
            assertEqual( [command1, command2, command3], stack.toArray() )
            assertEqual( 3, stack.length )
          })
          
          it("notifies observers", function() {
            assertEqual( 1, pointerTracker )
          })
          
          describe("followed by a command execution", function() {
            before(function() {
              command3.execute()
            })
            
            it("modifies the application state as expected", function() {
              assertEqual( 4, counter )
            })
            
            it("truncates the stack and adds the new command", function() {
              assertEqual( [command1, command3], stack.toArray() )
              assertEqual( 2, stack.length )
              assertEqual( 2, stack.pointer )
            })
          })
        })
      })
    })
    
    describe("using incremental undo/redo", function() {
      before(function() {
        this.stack = new JS.Command.Stack()
        
        var makeCommand = function(x) {
          return new JS.Command({
            execute: function() { counter += x },
            undo:    function() { counter -= x },
            stack:   stack
          })
        }
        
        this.command1 = makeCommand(1)
        this.command2 = makeCommand(2)
        this.command3 = makeCommand(3)
        
        this.command = command1
      })
      
      behavesLike("command stack")
    })
    
    describe("using redo-from-start", function() {
      before(function() {
        this.reset = new JS.Command({
          execute: function() { counter = 0 }
        })
        
        this.stack = new JS.Command.Stack({redo: reset})
        
        var makeCommand = function(x) {
          return new JS.Command({
            execute: function() { counter += x },
            stack:   stack
          })
        }
        
        this.command1 = makeCommand(1)
        this.command2 = makeCommand(2)
        this.command3 = makeCommand(3)
        
        this.command = command1
      })
      
      behavesLike("command stack")
    })
  })
})

