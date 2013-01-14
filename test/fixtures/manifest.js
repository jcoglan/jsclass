JS.Packages(function() { with(this) {
  file('https://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.js')
    .provides('jQuery')

  file('/common.js')
    .provides('Common')
    .styling('/a/b/c/c.css')
}})
