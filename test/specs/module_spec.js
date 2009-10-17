require("JS.Module", function() {
    ModuleSpec = JS.Test.describe("Module", function() { with(this) {
    
        before("all", function() {
            this.module = new JS.Module("NameOfTheModule", {
                firstMethod: function() {},
                secondMethod: function() {}
            });
        })
        
        it("should be a Module", function() { with(this) {
            assert( JS.isType(module, JS.Module) );
            assert( module instanceof JS.Module );
            assert( module.isA(JS.Module) );
        }})
        
        it("should have the correct display name", function() { with(this) {
            assertEqual( "NameOfTheModule", module.displayName );
        }})
        
        it("should have only itself as an ancestor", function() { with(this) {
            assertEqual( [module], module.ancestors() );
        }})
        
        describe("#instanceMethods", function() { with(this) {
            it("should return the names of the module's instance methods", function() { with(this) {
                assertEqual( ["firstMethod", "secondMethod"], module.instanceMethods().sort() );
            }})
        }})
    }})
});

