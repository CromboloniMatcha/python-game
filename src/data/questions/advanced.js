export default [
  { code: `def g():\n    yield 1\n    yield 2\nprint(sum(g()))`, answer: '3', wrong: ['12', '<generator object>', 'Error'], explain: 'sum consumes the generator: 1 + 2.' },
  { code: `a = [1]\nb = [1]\nprint(a is b)`, answer: 'False', wrong: ['True', 'None', 'Error'], explain: 'Equal values, but two different objects.' },
  { code: `fs = [lambda: i for i in range(3)]\nprint(fs[0]())`, answer: '2', wrong: ['0', '1', 'Error'], explain: 'Closures bind late: every lambda sees the final i.' },
  { code: `print({1, 2} | {2, 3})`, answer: '{1, 2, 3}', wrong: ['{2}', '{1, 2, 2, 3}', '[1, 2, 3]'], explain: '| is set union.' },
  { code: `print(*"ab", sep="-")`, answer: 'a-b', wrong: ['ab', 'a b', "('a', 'b')"], explain: '* unpacks the string into separate arguments.' },
];
