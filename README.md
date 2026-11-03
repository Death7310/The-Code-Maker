# The Code Maker

A browser-based, zero-to-specialist path for a security career. It assumes no prior knowledge and climbs through:

**Ground Zero → A+ Core 1 (220-1201) → A+ Core 2 (220-1202) → Linux hands-on → Network+ (N10-009) → Security+ (SY0-701) → Cloud foundations → AWS (CLF-C02) → Azure (AZ-900) → PenTest+ professional practice**

The order follows leverage: each stage reuses what the previous ones taught.

Coding tracks in **Bash, PowerShell and Python** (the three languages named in the PenTest+ objectives) run alongside the path. A **Review** queue uses spaced retrieval practice, bringing questions back at 1, 3, 7, 14 and 30 days.

**Missions** (12) are investigation scenarios inside a fictional company, starting right after Ground Zero. You work through evidence files in the terminal, answer questions, and make decisions that a simulated adversary reacts to. They unlock as you finish stages, and the support fades as you advance (Guided → Supported → Independent): a lost file and a data-handling request, phishing, disguised malware, a crypto-miner on a live Linux server, SSH brute force, a rogue DHCP server, a hosts-file hijack, ransomware, a public S3 bucket, a leaked Azure secret, and a penetration-test engagement with scope and ethics pressure. All names, domains (`.example`) and IPs (RFC 5737 documentation ranges) are fictional.

**Drills** generate endless subnetting, binary and port problems, each with a worked solution. **Practice exams** (A+ Core 1/2, Network+, Security+) pick questions in proportion to the official domain weights, shuffle the options, and report results by domain.

These lessons cover the skeleton of each exam, not all of it. Pair each stage with a complete study source and CompTIA's official objectives.

Everything runs in a simulated environment. Nothing touches real systems.

## Use it

**Website.** Once GitHub Pages is enabled (Settings → Pages → Source: *GitHub Actions*), every push to `main` publishes the site at `https://<owner>.github.io/<repo>/`. It's a Progressive Web App: on Android choose **Install app** in the browser menu, on iPhone **Share → Add to Home Screen**. It works offline after the first visit.

**Android APK.** Every push runs the *Android APK* workflow. Open the run in the **Actions** tab and download `TheCodeMaker-apk` under **Artifacts**. On the phone, allow installs from that source and open the APK. Pushing a tag such as `v1.0.0` also attaches the APK to a GitHub Release. These are debug builds for sideloading; publishing to Google Play needs a release signing key.

**Locally.** Open `index.html` in a browser; no build step is needed. Or run `npm run build` and serve `www/`.

- **Bash and Linux** lessons use a built-in simulated Linux system (`js/shell.js`): users, file permissions, `sudo`, processes, services, networking and runnable scripts.
- **Python** lessons run real Python in the browser via [Pyodide](https://pyodide.org). The first run needs internet; after that it's cached.
- **PowerShell** lessons are code-reading quizzes, which matches how the exam tests scripts.

Progress is stored on the device (localStorage).

## Build the APK yourself

Requires Node 22+, JDK 21 and the Android SDK (Android Studio installs it):

```
npm ci
npm run android:apk      # → android/app/build/outputs/apk/debug/app-debug.apk
```

## Structure

```
index.html            app shell
css/styles.css        styling (light/dark)
js/shell.js           sandboxed Bash-like interpreter (browser + Node)
js/content/*.js       one file per track (lessons + exercises as data)
js/curriculum.js      path order, coding tracks, certification roadmap
js/review.js          spaced-review (Leitner) scheduling
js/missions.js        scenario missions: evidence files, steps, scoring
js/drills.js          generated subnetting / binary / port problems
manifest.webmanifest  PWA manifest; sw.template.js → www/sw.js (offline cache)
scripts/build-web.js  builds www/ for GitHub Pages and the Android app
scripts/make-icons.py regenerates web + Android icons
android/              Capacitor Android project (wraps www/)
.github/workflows/    APK build + GitHub Pages deploy
js/exams.js           practice exams: domain-weighted question selection and grading
js/python-runner.js   lazy Pyodide loader
js/app.js             router, views, progress
tests/                node:test suites
```

## Tests

```
npm test
```

They check the shell interpreter (including the Linux permission model), the review scheduler, the build output, confirm every shell exercise and every mission question can be solved from its evidence files, and validate all question data.

## Adding a lesson

Add an object to the relevant file in `js/content/`. Each exercise is `shell` (match terminal output), `python` (match stdout), `quiz` (multiple choice) or `input` (short typed answer). Optional `review` items feed the spaced-review queue. If you add a `shell` exercise, add its reference solution to `tests/curriculum.test.js`.

## Ethics

Only test systems you own or have explicit written permission to test. Always check the current exam objectives on CompTIA's site.
