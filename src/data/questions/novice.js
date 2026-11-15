export default [
  { code: `for i in range(3):\n    print(i, end="")`, answer: '012', wrong: ['123', '0123', '321'], explain: 'range(3) yields 0, 1, 2.' },
  { code: `a = [1, 2, 3]\na.append(4)\nprint(a[-1])`, answer: '4', wrong: ['3', '1', '[4]'], explain: 'append adds to the end; index -1 is the last item.' },
  { code: `d = {"a": 1}\nprint(d.get("b", 0))`, answer: '0', wrong: ['None', 'KeyError', 'b'], explain: 'get returns the default when the key is missing.' },
  { code: `print("Python"[1:4])`, answer: 'yth', wrong: ['Pyt', 'ytho', 'tho'], explain: 'Slices include the start index and exclude the end.' },
  { code: `print(bool([]))`, answer: 'False', wrong: ['True', 'None', '[]'], explain: 'Empty containers are falsy.' },
];
