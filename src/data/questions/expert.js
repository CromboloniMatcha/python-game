export default [
  { code: `class A:\n    __slots__ = ("x",)\nA().y = 1`, answer: 'AttributeError', wrong: ['None', '1', 'TypeError'], explain: '__slots__ blocks creating attributes that are not declared.' },
  { code: `print(-7 // 2)`, answer: '-4', wrong: ['-3', '-3.5', '3'], explain: 'Floor division rounds toward negative infinity.' },
  { code: `Which standard module runs CPU-bound\nPython code in parallel, bypassing the GIL?`, answer: 'multiprocessing', wrong: ['threading', 'asyncio', 'itertools'], explain: 'Separate processes each have their own interpreter and GIL.' },
  { code: `print(type(type))`, answer: "<class 'type'>", wrong: ["<class 'object'>", "<class 'class'>", 'Error'], explain: 'type is its own metaclass.' },
  { code: `x = [1, 2]\ny = x\ny += [3]\nprint(x)`, answer: '[1, 2, 3]', wrong: ['[1, 2]', '[3]', 'Error'], explain: '+= on a list mutates it in place, and x points to the same list.' },
  { code: `class A: pass\nclass B(A): pass\nclass C(A): pass\nclass D(B, C): pass\nprint([k.__name__ for k in D.__mro__])`, answer: "['D', 'B', 'C', 'A', 'object']", wrong: ["['D', 'B', 'A', 'C', 'object']", "['D', 'C', 'B', 'A', 'object']", "['D', 'B', 'C', 'A']"], explain: 'C3 linearization keeps parents in order and puts shared bases last.' },
];
