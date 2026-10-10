# Career Atlas — Career & Talent Intelligence

Secure synthetic-data MVP: vanilla JavaScript responsive dashboard + stateless Python/FastAPI API. No AI provider, database, document storage, live company research, or message sending is configured. All public inputs are bounded synthetic choices. Real CV uploads and private-data APIs return 403, even if called outside the UI.

## Features
Seven sections: Dashboard, My Profile, Career Discovery, Company Intelligence, Outreach Studio, Interview Academy, Application Tracker. Career results are deterministic exploratory hypotheses, not validated suitability predictions. Company research is a clearly labeled checklist; no vacancies, companies or hiring contacts are inferred. Outreach is editable and never sent automatically. Tracker state is held in tab memory and disappears on refresh/reset. Do not enter personal data in editable drafts.

## Vercel
Import this GitHub repository into the intended Vercel team. Framework: Other. Root: repository root. No build command; output directory: `public`. Python dependencies are in `requirements.txt`; `api/index.py` exports FastAPI `app`. `vercel.json` routes `/api/*` to the function, uses Frankfurt, and configures browser security headers. No secrets are required for demo deployment. HTTPS is supplied by Vercel. Region choice alone does not establish EU/GDPR compliance.

## Tests
Install requirements plus `httpx` and `reportlab`, then run `python -m unittest discover -s tests -v`. Run `node --check public/app.js`. Offline PDF/DOCX parsing is tested only with generated synthetic documents and is deliberately not accessible over HTTP. Raw text extraction does not reliably structure qualifications; structured fields remain empty pending reviewed correction. Scanned PDFs/OCR are not supported.

## Personal-data activation prerequisites
Keep real uploads disabled until reviewed OIDC authentication, backend issuer/audience validation, per-user authorization, private encrypted EU document storage, retention/deletion workflows, consent and privacy disclosures, rate limiting and hostile-document isolation are implemented and tested. Never expose secrets in the browser or repository. Choose providers and review terms/subprocessors and residency before provisioning. No real-data processing is claimed in this demo.

## Current limitations
No live research, persistent tracker, login, private storage, real CV upload, automated reminders, external AI reasoning, or company-specific intelligence. These require a separate implementation and approved account/service configuration. The public demo intentionally has no personal-data mode or upload-enable environment switch.
