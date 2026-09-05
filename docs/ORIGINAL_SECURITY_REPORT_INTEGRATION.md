# Original Security Report integration

The CRM project report page now renders the supplied `security-report-main.zip` design as the source of truth.

## Style fidelity

`apps/web-fsa/src/pages/project-security-report/original/originalReport.css` is a byte-for-byte copy of the supplied report's `src/styles.css`.

The report is rendered into its own same-origin iframe document. The CRM theme, Chakra styles, CSS variables, resets, dark mode, and future global selectors cannot cross the iframe boundary.

## Source mapping

- supplied `src/main.jsx` -> `original/OriginalSecurityReport.tsx`
- supplied `src/styles.css` -> `original/originalReport.css`
- supplied `src/reportExtras.js` -> `original/originalReportExtras.ts`
- supplied `src/wstgData.js` -> `original/originalWstgData.ts`

Only integration changes were made to the JSX source:

1. It exports a React component instead of calling `createRoot` itself.
2. Project/report identifiers are overlaid at runtime from the selected CRM project.
3. A `Back to CRM` button is added using the original topbar/button styling.
4. Print targets the iframe's report document.

All original report sections, layout classes, print CSS, WSTG records, PoC/evidence structures, and visual styling remain sourced from the supplied report.

## Persian view

The Persian report uses the same original DOM/component and the same exact CSS file. A localization layer translates report labels and the bilingual WSTG/finding dataset inside the isolated iframe. Technical identifiers (WSTG, CWE, CVSS vectors, evidence IDs, hashes, HTTP/code blocks) remain LTR and unchanged.
