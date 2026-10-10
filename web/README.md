# Next.js Career & Talent Intelligence MVP

This is a separate Next.js App Router migration. Existing root-level FastAPI and vanilla JS files are retained for review. Set Vercel **Root Directory to `web`**, Framework to Next.js, Node to 22 or 24 LTS, Build Command to `npm run build`. Do not use the root Python Vercel configuration for this app.

## Current implementation
Ten responsive workspaces, light/dark theme, synthetic profile skill correction, three deterministic career categories with evidence and gaps, synthetic opportunity search/save, five editable outreach formats, interview questions, seven-day study checklist and browser Print / Save as PDF. Tracker and fictional executive search cases last only for the current tab session. No sending, notifications, live vacancies or company research. Live research has a verification checklist. Prisma PostgreSQL schema includes all requested models with user foreign keys and composite owner-constrained relationships for linked records. No database has been provisioned or migrated; there are no active database queries.

## Security boundary
Private endpoints `/api/profile`, `/api/profile/upload`, `/api/career/analyze`, `/api/opportunities`, `/api/outreach/generate`, `/api/interview/generate`, `/api/applications`, `/api/executive-search` return 403. Sign-in and uploads are disabled in the interface. No switch can enable personal-data mode. Public demo endpoints accept only Zod-validated enumerated skills/ambitions/preferences, with a streamed 2 KiB body limit. Freeform drafts and notes are held in browser memory only and must contain synthetic data. User isolation is not claimed as implemented authentication; denial of all private access is the current safety boundary.

## Environment
No environment variables are needed to run the demo. `DATABASE_URL` is needed only for Prisma validation/generation/migrations and a future private database implementation. Do not deploy real data until reviewed authentication, owner-scoped queries, private encrypted storage, hostile-document isolation, deletion/retention, EU privacy disclosures, consent and distributed rate limiting are implemented and tested. Future identity, AI and storage credentials must stay server-side; do not paste secrets in chat or commit them. No paid services were provisioned.

## Local checks
`npm ci`, `npm test`, `npm run typecheck`, `npm run build`.
`DATABASE_URL=postgresql://example:example@localhost:5432/example npm run db:validate` validates the schema without connecting to a database. For browser testing run `npm run start` after build. Sign-in, CV upload, company-specific research, persistent database records and direct PDF generation are unavailable. Browser PDF uses the user's print dialog.

## Acceptance paths
Open all navigation items, update synthetic profile choices, analyze, save a career hypothesis, update application status, generate/edit/copy outreach, select an interview role, generate a study plan and tick checkboxes. Settings deletes the demo state. Refresh removes all session records. Do not test with your own CV; upload is locked.
