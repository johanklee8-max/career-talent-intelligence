# Career & Talent Intelligence — Local MVP

A local-first CV + aspirations analysis prototype. **No external AI API or job board access.** The recommendation engine is transparent, deterministic and illustrative; it is not a validated hiring or career suitability predictor.

## Start

Python 3.11+ recommended.

```bash
python -m venv .venv
source .venv/bin/activate
# Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Open http://127.0.0.1:8000

Upload a PDF, DOCX, or TXT CV (max 5 MB), describe your ambitions, and select preferences. Click **Analyze my possibilities**.

## Privacy
- Local processing only; no external LLM or network API calls.
- CV content is processed in memory and not saved to disk or a database by the app.
- The server returns extracted text to the browser for review; do not deploy this prototype publicly.
- No user authentication, tenant isolation, audit logging or GDPR-ready data lifecycle yet.
- A scanned/image-only PDF will not extract; supply a text-based PDF or DOCX.
- PDF/DOCX parsing is not a sandbox for hostile files. Only upload documents you trust.

## Architecture
`app/main.py`: FastAPI upload and analysis endpoint.
`app/engine.py`: transparent career-path hypothesis engine with skill signals and gaps.
`app/static/index.html`: interactive frontend.

## Next production steps
Authentication, consent, secure storage, real occupational taxonomy (ESCO), curated evidence and vacancy feeds, expert feedback, LLM reasoning with source grounding, evaluation suite and data protection review.

## Tests
```bash
python -m unittest discover -s tests -v
```
