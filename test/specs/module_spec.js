ModuleSpec = JS.Test.describe("Module", function() { with(this) {
    
    it("should inherit from Kernel", function() { with(this) {
        assertEqual( [JS.Kernel, JS.Module], JS.Module.ancestors() );
    }})
    
    describe("instance", function() { with(this) {
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
        
        it("should give display names to its methods", function() { with(this) {
            assertEqual( "NameOfTheModule#firstMethod",
                         module.instanceMethod("firstMethod").displayName );
            
            assertEqual( "NameOfTheModule#secondMethod",
                         module.instanceMethod("secondMethod").displayName );
        }})
        
        it("should have only itself as an ancestor", function() { with(this) {
            assertEqual( [module], module.ancestors() );
        }})
        
        it("should provide reflection on its instance methods", function() { with(this) {
            assertEqual( ["firstMethod", "secondMethod"], module.instanceMethods().sort() );
            assertKindOf( Function, module.instanceMethod("firstMethod") );
            assertKindOf( Function, module.instanceMethod("secondMethod") );
        }})
        
        describe("with one ancestor", function() { with(this) {
            before("all", function() {
                this.ancestor = new JS.Module({ foo: function() {} });
                this.module.include(this.ancestor);
            })
            
            it("should list the ancestor in its ancestry", function() { with(this) {
                assertEqual( [ancestor, module], module.ancestors() );
            }})
            
            describe("#instanceMethods", function() { with(this) {
                it("should list the ancestor's instance methods by default", function() { with(this) {
                    assertEqual( ["firstMethod", "foo", "secondMethod"],
                                 module.instanceMethods().sort() );
                }})
                
                it("should exclude the ancestor's instance methods when passed false", function() { with(this) {
                    assertEqual( ["firstMethod", "secondMethod"],
                                 module.instanceMethods(false).sort() );
                }})
            }})
        }})
    }})
}})

