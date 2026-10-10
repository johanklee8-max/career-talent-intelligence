"""Offline parser only. Deliberately not exposed through the public demo API."""
from io import BytesIO
from zipfile import ZipFile, BadZipFile
from pypdf import PdfReader
from docx import Document
MAX_BYTES = 3 * 1024 * 1024

def extract(data: bytes, kind: str):
    if not data or len(data) > MAX_BYTES:
        raise ValueError('Document must be nonempty and at most 3 MiB')
    if kind == 'pdf':
        if not data.startswith(b'%PDF-'):
            raise ValueError('Invalid PDF signature')
        reader = PdfReader(BytesIO(data))
        if reader.is_encrypted or len(reader.pages) > 40:
            raise ValueError('Encrypted or oversized PDF is unsupported')
        text = '\n'.join(page.extract_text() or '' for page in reader.pages)
    elif kind == 'docx':
        if not data.startswith(b'PK'):
            raise ValueError('Invalid DOCX signature')
        try:
            with ZipFile(BytesIO(data)) as archive:
                if sum(i.file_size for i in archive.infolist()) > 10 * 1024 * 1024 or len(archive.infolist()) > 1000:
                    raise ValueError('Expanded document exceeds limits')
                if any('vbaProject' in i.filename for i in archive.infolist()):
                    raise ValueError('Macros are not allowed')
            text = '\n'.join(p.text for p in Document(BytesIO(data)).paragraphs)
        except BadZipFile as exc:
            raise ValueError('Invalid DOCX') from exc
    else:
        raise ValueError('Only PDF and DOCX are supported')
    if not text.strip() or len(text) > 100000:
        raise ValueError('No extractable text or text exceeds limits')
    return {'text': text.strip(), 'experience': [], 'education': [], 'skills': [], 'languages': [], 'qualifications': [], 'review_required': True, 'notice': 'Raw text extraction only. Structured qualifications require user review; none are inferred.'}
