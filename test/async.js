JSCLASS_PATH = 'build/min/'
require('../' + JSCLASS_PATH + 'loader')

JS.require('JS.Test', 'JS.MethodChain', function() {
    
    JS.Test.describe('Asynchronous testing', function() {
      
      this.describe('simple test', function() {
        this.it('allows async assertions', function(resume) {
          setTimeout(function() {
            resume(function() { this.assert(false) })
          }, 1000);
        })
      })
    })
    
    JS.Test.autorun()
})

