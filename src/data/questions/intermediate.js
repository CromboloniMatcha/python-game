export default [
  { code: `print([x*x for x in range(4)])`, answer: '[0, 1, 4, 9]', wrong: ['[1, 4, 9, 16]', '[0, 1, 2, 3]', '[0, 2, 4, 6]'], explain: 'List comprehension squares 0..3.' },
  { code: `def f(a, b=[]):\n    b.append(a)\n    return b\nf(1)\nprint(f(2))`, answer: '[1, 2]', wrong: ['[2]', '[1]', 'Error'], explain: 'The default list is created once and shared between calls.' },
  { code: `print(sorted("bca", reverse=True))`, answer: "['c', 'b', 'a']", wrong: ["['a', 'b', 'c']", 'cba', "['b', 'c', 'a']"], explain: 'sorted always returns a list.' },
  { code: `t = (1, 2)\nt[0] = 5`, answer: 'TypeError', wrong: ['(5, 2)', 'IndexError', '(1, 2)'], explain: 'Tuples are immutable.' },
  { code: `print(list(zip("ab", [1, 2])))`, answer: "[('a', 1), ('b', 2)]", wrong: ["[('a', 'b'), (1, 2)]", "['a1', 'b2']", "{'a': 1, 'b': 2}"], explain: 'zip pairs items by position.' },
];
