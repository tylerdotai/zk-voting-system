# whitepaper-latex

Judge/submission PDF source for the ZK Voting System whitepaper.

Based on the template from:
- https://github.com/saboyle/latex-template-whitepaper-basic

## Files
- `whitepaper.tex` — main LaTeX source
- `WHITEPAPER-source.md` — source markdown from the repo whitepaper
- `logo.png` — project logo used on the title page
- `whitepaper.pdf` — compiled output for submission

## Build
If you have a local LaTeX toolchain:

```bash
pdflatex whitepaper.tex
pdflatex whitepaper.tex
```

Or use Docker/Tectonic as needed.
