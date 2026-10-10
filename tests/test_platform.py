import unittest
from io import BytesIO
from fastapi.testclient import TestClient
from api.index import app
from app.cv_parser import extract, MAX_BYTES
from docx import Document
from reportlab.pdfgen.canvas import Canvas

class PlatformTests(unittest.TestCase):
    def setUp(self): self.client = TestClient(app)
    def test_health(self):
        r=self.client.get('/api/health'); self.assertEqual(r.status_code,200); self.assertFalse(r.json()['uploads_enabled'])
    def test_demo_analysis_and_correction(self):
        r=self.client.post('/api/demo/analyze',json={'skills':['SQL'],'ambition':'technical','environment':'remote'})
        self.assertEqual(r.status_code,200); d=r.json(); self.assertEqual(d['profile']['skills'],['SQL']); self.assertEqual(len(d['matches']),3)
        self.assertIn('SQL',d['outreach']['email']); self.assertTrue(d['interview']['learning_sheet']); self.assertEqual(d['research']['companies'],[])
    def test_private_routes_denied(self):
        for method,path in [('post','/api/upload'),('get','/api/private/cvs'),('delete','/api/private/cvs/other-user'),('get','/api/upload')]:
            self.assertEqual(getattr(self.client,method)(path).status_code,403)
    def test_validation(self):
        for payload in [{'skills':['Invented diploma']},{'ambition':'invalid'},{'name':'Personal info'}]:
            self.assertEqual(self.client.post('/api/demo/analyze',json=payload).status_code,422)
        self.assertEqual(self.client.post('/api/demo/analyze',content=b'x'*2049).status_code,413)
        self.assertEqual(self.client.get('/api/missing').status_code,404)
    def test_pdf(self):
        b=BytesIO();c=Canvas(b);c.drawString(72,720,'Synthetic Analyst - Python');c.save();r=extract(b.getvalue(),'pdf');self.assertIn('Python',r['text']);self.assertTrue(r['review_required']);self.assertEqual(r['qualifications'],[])
    def test_docx(self):
        b=BytesIO();d=Document();d.add_paragraph('Synthetic Coordinator - Research');d.save(b);self.assertIn('Research',extract(b.getvalue(),'docx')['text'])
    def test_parser_rejects_invalid(self):
        for data,kind in [(b'bad','pdf'),(b'bad','docx'),(b'x'*(MAX_BYTES+1),'pdf'),(b'text','txt')]:
            with self.assertRaises(ValueError): extract(data,kind)
    def test_privacy_headers(self):
        r=self.client.get('/api/health');self.assertEqual(r.headers['cache-control'],'no-store');self.assertEqual(r.headers['x-content-type-options'],'nosniff')

if __name__=='__main__': unittest.main()
