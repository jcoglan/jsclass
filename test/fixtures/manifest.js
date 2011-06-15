JS.Packages(function() { with(this) {
  file('http://code.jquery.com/jquery-1.6.1.js')
    .provides('jQuery')
  
  file('/common.js')
    .provides('Common')
}})
