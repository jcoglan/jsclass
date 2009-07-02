JS.Test = new JS.Module('Test', {
  extend: {
    Unit: new JS.Module({
      extend: {
        run: false
      }
    })
  }
});

