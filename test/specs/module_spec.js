ModuleSpec = JS.Test.describe("Module", function() { with(this) {
    
    it("inherits from Kernel", function() { with(this) {
        assertEqual( [JS.Kernel, JS.Module], JS.Module.ancestors() );
    }})
    
    describe("instance", function() { with(this) {
        before("all", function() {
            this.module = new JS.Module("NameOfTheModule", {
                firstMethod: function() {},
                secondMethod: function() {}
            });
        })
        
        it("is a Module", function() { with(this) {
            assert( JS.isType(module, JS.Module) );
            assert( module instanceof JS.Module );
            assert( module.isA(JS.Module) );
        }})
        
        it("has the correct display name", function() { with(this) {
            assertEqual( "NameOfTheModule", module.displayName );
        }})
        
        it("gives display names to its methods", function() { with(this) {
            assertEqual( "NameOfTheModule#firstMethod",
                         module.instanceMethod("firstMethod").displayName );
            
            assertEqual( "NameOfTheModule#secondMethod",
                         module.instanceMethod("secondMethod").displayName );
        }})
        
        it("has only itself as an ancestor", function() { with(this) {
            assertEqual( [module], module.ancestors() );
        }})
        
        it("provides reflection on its instance methods", function() { with(this) {
            assertEqual( ["firstMethod", "secondMethod"], module.instanceMethods().sort() );
            assertKindOf( Function, module.instanceMethod("firstMethod") );
            assertKindOf( Function, module.instanceMethod("secondMethod") );
        }})
        
        describe("with one included module", function() { with(this) {
            before("all", function() {
                this.ancestor = new JS.Module({ foo: function() {} });
                this.module.include(this.ancestor);
            })
            
            it("lists the included module in its ancestry", function() { with(this) {
                assertEqual( [ancestor, module], module.ancestors() );
            }})
            
            describe("#instanceMethods", function() { with(this) {
                it("lists the included module's instance methods by default", function() { with(this) {
                    assertEqual( ["firstMethod", "foo", "secondMethod"],
                                 module.instanceMethods().sort() );
                }})
                
                it("excludes the included module's instance methods when passed false", function() { with(this) {
                    assertEqual( ["firstMethod", "secondMethod"],
                                 module.instanceMethods(false).sort() );
                }})
            }})
        }})
    }})
}})

