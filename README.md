# The Code Maker

A browser-based, zero-to-specialist path for a security career. It assumes no prior knowledge and climbs through:

**Ground Zero → A+ Core 1 (220-1201) → A+ Core 2 (220-1202) → Network+ (N10-009) → Security+ (SY0-701) → PenTest+ professional practice**

Coding tracks in **Bash, PowerShell and Python** (the three languages named in the PenTest+ objectives) run alongside the path. A **Review** queue uses spaced retrieval practice, bringing questions back at 1, 3, 7, 14 and 30 days.

These lessons cover the skeleton of each exam, not all of it. Pair each stage with a complete study source and CompTIA's official objectives.

Everything runs in a simulated environment. Nothing touches real systems.

## Run it

Open `index.html` in a browser. There's no build step and nothing to install.

- **Bash** lessons use a built-in simulated shell (`js/shell.js`) with a virtual filesystem and sample logs.
- **Python** lessons run real Python in the browser via [Pyodide](https://pyodide.org). It needs an internet connection the first time.
- **PowerShell** lessons are code-reading quizzes, which matches how the exam tests scripts. Install PowerShell 7 locally to practice for real.

Progress is saved in your browser (localStorage).

## Structure

```
index.html            app shell
css/styles.css        styling (light/dark)
js/shell.js           sandboxed Bash-like interpreter (browser + Node)
js/content/*.js       one file per track (lessons + exercises as data)
js/curriculum.js      path order, coding tracks, certification roadmap
js/review.js          spaced-review (Leitner) scheduling
js/python-runner.js   lazy Pyodide loader
js/app.js             router, views, progress
tests/                node:test suites
```

## Tests

```
npm test
```

They check the shell interpreter and the review scheduler, confirm every shell exercise can be solved, and validate all question data.

## Adding a lesson

Add an object to the relevant file in `js/content/`. Each exercise is `shell` (match terminal output), `python` (match stdout), `quiz` (multiple choice) or `input` (short typed answer). Optional `review` items feed the spaced-review queue. If you add a `shell` exercise, add its reference solution to `tests/curriculum.test.js`.

## Ethics

Only test systems you own or have explicit written permission to test. Always check the current exam objectives on CompTIA's site.
