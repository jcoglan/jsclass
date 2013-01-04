(function() {

var E = (typeof exports === "object"),
    Command = (E ? loadModule("command") : JS).Command

JS.ENV.CommandSpec = JS.Test.describe(Command, function() { with(this) {
  before(function() { this.counter = 0 })

  describe("with an execute() method", function() { with(this) {
    before(function() { with(this) {
      this.command = new Command({
        execute: function() { counter += 1 }
      })
    }})

    it("runs the commmand with execute()", function() { with(this) {
      assertEqual( 0, counter )
      command.execute()
      assertEqual( 1, counter )
    }})

    it("does nothing when undo() is called", function() { with(this) {
      command.undo()
      assertEqual( 0, counter )
    }})
  }})

  describe("with execute() and undo() methods", function() { with(this) {
    before(function() { with(this) {
      this.command = new Command({
        execute: function() { counter += 1 },
        undo:    function() { counter -= 1 }
      })
    }})

    it("runs the commmand with execute()", function() { with(this) {
      assertEqual( 0, counter )
      command.execute()
      assertEqual( 1, counter )
    }})

    it("undoes the command with undo()", function() { with(this) {
      assertEqual( 0, counter )
      command.undo()
      assertEqual( -1, counter )
    }})
  }})

  describe(Command.Stack, function() { with(this) {
    sharedBehavior("command stack", function() { with(this) {
      describe("with no commands in the stack", function() { with(this) {
        describe("#undo", function() { with(this) {
          before(function() { this.stack.undo() })

          it("has no effect", function() { with(this) {
            assertEqual( 0, counter )
            assertEqual( 0, stack.length )
            assertEqual( 0, stack.pointer )
          }})
        }})

        describe("#redo", function() { with(this) {
          before(function() { this.stack.redo() })

          it("has no effect", function() { with(this) {
            assertEqual( 0, counter )
            assertEqual( 0, stack.length )
            assertEqual( 0, stack.pointer )
          }})
        }})
      }})

      describe("running a command", function() { with(this) {
        before(function() { this.command.execute() })

        it("adds the command to the stack", function() { with(this) {
          assertEqual( [command], stack.toArray() )
          assertEqual( 1, stack.length )
          assertEqual( 1, stack.pointer )
        }})
      }})

      describe("with a command in the stack", function() { with(this) {
        before(function() { this.command.execute() })

        describe("#redo", function() { with(this) {
          before(function() { this.stack.redo() })

          it("has no effect", function() { with(this) {
            assertEqual( 1, counter )
            assertEqual( [command], stack.toArray() )
            assertEqual( 1, stack.length )
            assertEqual( 1, stack.pointer )
          }})
        }})

        describe("#undo", function() { with(this) {
          before(function() { this.stack.undo() })

          it("undoes the command", function() { with(this) {
            assertEqual( 0, counter )
          }})

          it("leaves the command in the stack", function() { with(this) {
            assertEqual( [command], stack.toArray() )
            assertEqual( 1, stack.length )
          }})

          it("sets the stack pointer to the command's index", function() { with(this) {
            assertEqual( 0, stack.pointer )
          }})

          describe("followed by #redo", function() { with(this) {
            before(function() { this.stack.redo() })

            it("re-executes the command", function() { with(this) {
              assertEqual( 1, counter )
            }})

            it("increments the stack pointer", function() { with(this) {
              assertEqual( 1, stack.pointer )
            }})
          }})
        }})
      }})

      describe("with a few commands in the stack", function() { with(this) {
        before(function() { with(this) {
          command1.execute()
          command2.execute()
          command3.execute()
          assertEqual( 6, counter )

          this.pointerTracker = 0
          stack.subscribe(function() { pointerTracker = stack.pointer })
        }})

        describe("executing a command", function() { with(this) {
          it("notifies observers", function() { with(this) {
            assertEqual( 0, pointerTracker )
            command.execute()
            assertEqual( 4, pointerTracker )
          }})
        }})

        describe("#undo", function() { with(this) {
          it("undoes each command in reverse order", function() { with(this) {
            stack.undo()
            assertEqual( 3, counter )
            stack.undo()
            assertEqual( 1, counter )
            stack.undo()
            assertEqual( 0, counter )
          }})

          it("steps the stack pointer down once each time", function() { with(this) {
            stack.undo()
            assertEqual( 2, stack.pointer )
            stack.undo()
            assertEqual( 1, stack.pointer )
            stack.undo()
            assertEqual( 0, stack.pointer )
          }})

          it("leaves the stack intact", function() { with(this) {
            stack.undo()
            assertEqual( [command1, command2, command3], stack.toArray() )
            assertEqual( 3, stack.length )
          }})

          it("notifies observers", function() { with(this) {
            assertEqual( 0, pointerTracker )
            stack.undo()
            assertEqual( 2, pointerTracker )
          }})
        }})

        describe("#redo", function() { with(this) {
          before(function() { with(this) {
            stack.undo()
            assertEqual( 3, counter )
          }})

          it("redoes the last undone command", function() { with(this) {
            stack.undo()
            assertEqual( 1, counter )
            stack.redo()
            assertEqual( 3, counter )
            stack.redo()
            assertEqual( 6, counter )
          }})

          it("notifies observers", function() { with(this) {
            assertEqual( 2, pointerTracker )
            stack.redo()
            assertEqual( 3, pointerTracker )
          }})
        }})

        describe("#stepTo", function() { with(this) {
          before(function() { this.stack.stepTo(1) })

          it("jumps to the given index in the stack's history", function() { with(this) {
            assertEqual( 1, counter )
          }})

          it("sets the stack pointer to the given index", function() { with(this) {
            assertEqual( 1, stack.pointer )
          }})

          it("leaves the stack intact", function() { with(this) {
            assertEqual( [command1, command2, command3], stack.toArray() )
            assertEqual( 3, stack.length )
          }})

          it("notifies observers", function() { with(this) {
            assertEqual( 1, pointerTracker )
          }})

          describe("followed by a command execution", function() { with(this) {
            before(function() { this.command3.execute() })

            it("modifies the application state as expected", function() { with(this) {
              assertEqual( 4, counter )
            }})

            it("truncates the stack and adds the new command", function() { with(this) {
              assertEqual( [command1, command3], stack.toArray() )
              assertEqual( 2, stack.length )
              assertEqual( 2, stack.pointer )
            }})
          }})
        }})
      }})
    }})

    describe("using incremental undo/redo", function() { with(this) {
      before(function() { with(this) {
        this.stack = new Command.Stack()

        var makeCommand = function(x) {
          return new Command({
            execute: function() { counter += x },
            undo:    function() { counter -= x },
            stack:   stack
          })
        }

        this.command1 = makeCommand(1)
        this.command2 = makeCommand(2)
        this.command3 = makeCommand(3)

        this.command = command1
      }})

      behavesLike("command stack")
    }})

    describe("using redo-from-start", function() { with(this) {
      before(function() { with(this) {
        this.reset = new Command({
          execute: function() { counter = 0 }
        })

        this.stack = new Command.Stack({redo: reset})

        var makeCommand = function(x) {
          return new Command({
            execute: function() { counter += x },
            stack:   stack
          })
        }

        this.command1 = makeCommand(1)
        this.command2 = makeCommand(2)
        this.command3 = makeCommand(3)

        this.command = command1
      }})

      behavesLike("command stack")
    }})
  }})
}})

})()

