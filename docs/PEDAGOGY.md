# Teaching design (research notes)

How the Learn section is built, and the research behind each choice.

| Feature in the game | Idea | Source |
|---|---|---|
| Predict first, then see the output | PRIMM: Predict, Run, Investigate, Modify, Make | Sentance, Waite & Kallia (2019), Computer Science Education 29(2-3) |
| Arrange-the-code exercises | Parsons problems are more efficient than writing from scratch, with similar learning | Ericson et al. (ICER 2018); Hou, Ericson & Wang (2023) |
| Worked example, then guided practice | Worked examples reduce cognitive load; fade support step by step | Sweller (cognitive load theory); worked-example effect |
| Several short examples per concept | Variety of examples helps deep understanding | Worked/faded example guidance (MIT FYE) |
| Trace tables | Tracing code builds a mental model of execution | Tracing and code-comprehension research |
| "Common mistake" boxes, names diagram | Variables are names, not boxes; aliasing and mutable defaults are classic stumbling blocks | Ned Batchelder, "Facts and myths about Python names and values" |
| Quiz after every lesson + mixed Review | Retrieval practice, interleaving, spacing (small to moderate effects in real classrooms) | Meta-analysis summary, Oct 2026 |
| Lesson, practice, check, project | Structure of Harvard's CS50P on edX | cs50.harvard.edu/python |

## Known limits / next steps
- Make step: PRIDAM research found "Make" is hard for multi-statement problems, so Parsons and trace steps come first; add a "write your own" step later (needs an in-browser Python runner such as Pyodide).
- Parsons can be solved without understanding, so every exercise shows an explanation after success.
- Real spacing needs a schedule (due dates per lesson); today Review is mixed practice only.
