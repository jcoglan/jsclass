JS.Test.Reporters.extend({
  Testem: new JS.Class({
    initialize: function() {
      var self = this;
      Testem.useCustomAdapter(function(socket) { self._socket = socket });
    },
    
    startRun: function(event) {
      this._results = [];
      this._testId = 0;
      this._socket.emit('tests-start');
    },
    
    startSuite: function(event) {},
    
    startTest: function(event) {
      this._testPassed = true;
      this._faults = [];
    },
    
    addFault: function(event) {
      this._testPassed = false;
      this._faults.push({
        passed:     false,
        message:    event.error.message,
        stacktrace: event.error.backtrace
      });
    },
    
    endTest: function(event) {
      var result = {
        passed: this._testPassed ? 1 : 0,
        failed: this._testPassed ? 0 : 1,
        total:  1,
        id:     ++this._testId,
        name:   event.fullName,
        items:  this._faults
      };
      this._results.push(result);
      this._socket.emit('test-result', result);
    },
    
    endSuite: function(event) {},
    
    update: function(event) {},
    
    endRun: function(event) {
      this._socket.emit('all-test-results', {
        passed: event.tests - event.failures - event.errors,
        failed: event.failures,
        total:  event.tests,
        tests:  this._results
      });
    }
  })
});

