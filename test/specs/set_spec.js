SetSpec = JS.Test.describe('Set', function() { with(this) {
    
    before('all', function() {
        this.hash = new JS.Hash(['foo', 4, 'bar', 5]);
    })
    
    it('should retrieve values', function() { with(this) {
        assertEqual( 5, hash.get('bar') );
    }})
}});

