# Reads the license file and returns its contents formatted as
# a multiline JavaScript comment for embedding in source code
jake :license do
  "/**\n" + File.read('MIT-LICENSE').split(/\n/).map { |line|
    " * #{ line }"
  }.join("\n") + "\n */"
end

