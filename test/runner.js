JSCLASS_PATH = 'build/src/';
load(JSCLASS_PATH + 'loader.js');

require('JS.Test', function() {
  
    JS.Test.describe('Food', function() { with(this) {
    
        before('each', function() {
            this.user = 'Bob';
        })
        
        before('all', function() {
          this.theName = 'something';
        })
        
        should('be tasty', {
            before: function() { this.something = true }
          
        }, function() {
            this.assert( this.something );
        })
        
        it('tastes good', function() {
            this.assert( false );
        })
        
        context('from Spain', function() { with(this) {
            before(function() {
                this.guy = 'Juan';
            })
            
            it('contains prawns', function() {
                this.assertEqual( 'Bob', this.user );
                this.assertEqual( 'Juan', this.guy );
            })
            
            it('should get a name from the "all" hook', function() {
                this.assertEqual( 'something', this.theName );
            })
        }})
    }})
})

JS.Test.autorun();

