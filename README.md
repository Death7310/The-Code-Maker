# The Code Maker

A browser-based course in the scripting languages named in the CompTIA PenTest+ objectives (**Bash, Python, PowerShell**), plus the professional groundwork (authorization, scope, methodology, reporting) and a career roadmap.

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
js/curriculum.js      all lessons and exercises, as data
js/python-runner.js   lazy Pyodide loader
js/app.js             router, views, progress
tests/                node:test suites
```

## Tests

```
npm test
```

They check the shell interpreter, confirm every Bash exercise can be solved, and validate the quiz data.

## Adding a lesson

Add an object to the relevant track in `js/curriculum.js`. Each exercise is `shell` (match terminal output), `python` (match stdout) or `quiz`. If you add a `shell` exercise, add its reference solution to `tests/curriculum.test.js`.

## Ethics

Only test systems you own or have explicit written permission to test. Always check the current exam objectives on CompTIA's site.
