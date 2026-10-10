# Career Atlas on Vercel

Vercel root directory: `web`; framework: Next.js; Node 24; build: `npm run build`. The root-level FastAPI prototype is retained but is not this deployment.

## No-login CV workflow

My Career Profile accepts text-based PDF and DOCX files, up to 3 MiB (PDF: 40 pages). PDF.js extracts PDF text in a same-origin worker; fflate extracts only DOCX document XML, with a 10 MiB expansion limit, 1,000-entry limit, macro and unsafe XML rejection. Document text is rendered as text, never HTML. CV text, corrections and preferences remain exclusively in browser memory: no server upload, localStorage, database or AI transmission. Clear my CV or refresh removes workspace state. No Clerk or authentication service is needed for this local-only version.

Review and correct extracted text, then confirm skill signals. Keywords are not proof of proficiency. The initial English/German skill catalog and 20 career templates rank paths by reviewed skill overlap and a small ambition-keyword tie-breaker. This is exploratory guidance, not a comprehensive CV assessment or hiring prediction. Seniority, dates, licences, qualifications, salaries and eligibility are not assessed. Scanned documents need OCR before use; OCR is not provided.

Find live listings retrieves a public Arbeitnow feed from `/api/jobs` and filters locally by skill/title/tag overlap and location. The server fetches the same fixed public URL for everyone and receives no CV or preferences. Public results can be cached for 15 minutes. Listings have source URLs and source posting dates; company claims and availability are not independently verified. Coverage is limited, primarily Germany. LinkedIn search links disclose only the chosen role query and location when clicked. No automatic messaging or applications.

Other dashboard features remain labelled synthetic templates and do not use your CV. No persistent user workspace. Server personal-data endpoints still return 403. No secrets, paid services or database setup are needed. Health reports browser-local CV support separately from disabled server uploads.

## Validation

`npm ci`, `npm run typecheck`, `npm test`, `npm run build`. Tests cover signatures, size and expansion limits, macros, unsafe XML, corrected evidence/ranking, source restrictions, job-source failure and denial of server uploads. Built-in fictional sample PDF/DOCX controls exercise the actual browser parsers.

Production checks: both parser controls, corrected text and skills, live jobs/failure messaging, navigation, clear and refresh. Complex documents may not extract cleanly; review the text. Matching and job coverage are limited and disclosed in the interface.
