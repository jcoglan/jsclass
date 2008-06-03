module ModA
  def speak
    "speak() in ModA"
  end
end

module ModB
  def speak
    "speak() in ModB, #{super}"
  end
end

module ModC
  include ModA
  def speak
    "#{super}, and in ModC"
  end
  include ModB
end

class Foo
  def speak
    "#{super}, and in class Foo"
  end
  include ModC
end

puts Foo.new.speak
class Bar
  def speak
    "speak() in class Bar"
  end
end

b = Bar.new
def b.speak
  super.upcase
end
puts b.speak
b.extend(ModB)
puts b.speak

