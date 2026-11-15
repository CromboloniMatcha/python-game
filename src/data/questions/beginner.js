export default [
  { code: `print(2 + 3 * 2)`, answer: '8', wrong: ['10', '7', '12'], explain: 'Multiplication happens before addition: 3*2=6, then 2+6=8.' },
  { code: `x = "hi"\nprint(x * 3)`, answer: 'hihihi', wrong: ['hi3', 'hi hi hi', 'Error'], explain: 'Multiplying a string repeats it.' },
  { code: `print(type(3.0))`, answer: "<class 'float'>", wrong: ["<class 'int'>", "<class 'str'>", "<class 'double'>"], explain: 'Any number with a decimal point is a float.' },
  { code: `print(len("python"))`, answer: '6', wrong: ['5', '7', 'python'], explain: 'len counts characters.' },
  { code: `print(7 // 2)`, answer: '3', wrong: ['3.5', '4', '2'], explain: '// is floor division.' },
];
