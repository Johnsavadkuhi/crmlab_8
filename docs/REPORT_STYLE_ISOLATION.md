# Security Report Style Isolation

The project security report is deliberately rendered in an isolated browser document so CRM styles cannot modify the report design.

## Implementation

`ProjectSecurityReport.tsx` renders report content into a same-origin `iframe` using a React portal.

- `securityReport.css` is imported with Vite `?inline` and is **not** added to the CRM document.
- The report stylesheet is injected only into the iframe `<head>`.
- Vazirmatn font-face CSS is also injected only into the report iframe.
- A report-local reset supplies box sizing, base body background, form-font inheritance, and light color-scheme without depending on CRM global CSS.
- The iframe is a separate CSS document boundary. CRM selectors, Chakra/Emotion rules, theme variables, dark mode, `:root`, `body`, element resets, and future global CSS changes cannot cross this boundary.
- Print/PDF invokes `iframe.contentWindow.print()`, so only the isolated report document is printed.
- React Router navigation and project data remain managed by the CRM parent application; only presentation is isolated.

## Invariant

The report must never revert to a normal `import "./securityReport.css"` global stylesheet import. Keep the `?inline` import and iframe/portal boundary so the report remains visually deterministic.
