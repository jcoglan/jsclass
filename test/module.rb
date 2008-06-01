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
