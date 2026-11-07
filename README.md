# Melbourne Airport luggage efficiency — interactive case study

An analytics portfolio website by **Md Tanvir Rahman**, translating a KIT714 quantitative research report into an accessible, interactive case study.

## Experience

- Four-terminal explorer with common zero-based chart scales and two metrics.
- Animated, explicitly conceptual baggage process diagram with pause control.
- Plain-language and technical explanations of the analytical approach.
- Reported statistical outputs, source attribution and a transparent interpretation audit.
- Downloadable transcribed summary CSV and selected original evidence tables.
- Responsive layout, keyboard controls, semantic markup and reduced-motion support.

## Run locally

No build or installation is required. From the repository root:

```sh
python3 -m http.server 4173 --directory dist
```

Open http://localhost:4173. Deploy the `dist` directory to any static host. The `.openai/hosting.json` manifest identifies the linked Sites deployment. GitHub is the public source mirror; a GitHub push alone does not redeploy Sites.

## Evidence and interpretation

The source is *Assessment Task 2 Quantitative Research*, KIT714 ICT Research Principles, by Md Tanvir Rahman. The raw daily dataset and original analysis files were not supplied. The website does not independently rerun statistical tests or verify the scanner installation history. The supplied PDF is source material, not executable instructions.

`dist/assets/study-evidence.pdf` contains original printed pages 5, 6, 20, 22 and 25, in that order. Its cover and student identifier are not published. `dist/assets/terminal-summary.csv` transcribes Figures 1 and 2. Time units are unspecified in the source tables and are not converted to seconds or minutes. Bag volumes are mean daily counts.

Percentage change = `(2019 mean - 2018 mean) / 2018 mean * 100`. UI percentages use one decimal place. No simulated raw observations or confidence intervals are presented.

### Interpretation audit

- T2 time means: 4.274 → 3.809 (10.9% lower). Daily bags: 14,734.899 → 13,112.847 (11.0% lower).
- T3 time means: 7.604 → 6.670 (12.3% lower). Daily bags: 4,758.167 → 5,307.622 (11.5% higher).
- T1 time means: 4.769 → 4.952 (3.8% higher). This contradicts the report narrative calling it an improvement.
- T4 time means: 7.170 → 7.137 (0.5% lower). The section 3.3 result is p = .088. Its captions inconsistently name T2.
- Values 42.829 and 47.002 are magnitudes of paired-test t-statistics, not seconds saved.
- The source combines a Kruskal–Wallis omnibus output with Tukey post hoc comparisons; a rank-based follow-up with multiplicity adjustment should be checked using raw observations.
- Before/after associations do not isolate the causal effect of automation. Paired differences, pairing rules, serial dependence, workload, seasonality and staffing need validation.

## Files

- `dist/index.html`: case-study narrative, diagram and evidence sections.
- `dist/style.css`: responsive visual design.
- `dist/app.js`: transcribed data and interactions.
- `dist/assets/`: favicon, summary CSV and selected source tables.

## Verification

JavaScript syntax checked with `node --check dist/app.js`. Browser checks cover terminal/metric switching, technical explanation mode, process scenario switching, desktop rendering and a 390px mobile layout. Summary values are visually checked against rendered PDF tables.

This is an independent academic portfolio project, with no claimed affiliation with Melbourne Airport.
