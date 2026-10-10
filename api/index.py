from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from app.engine import DemoRequest, DEMO, analyze

app = FastAPI(title='Career & Talent Intelligence demo', docs_url=None, redoc_url=None, openapi_url=None)

@app.middleware('http')
async def privacy_headers(request: Request, call_next):
    if request.url.path != '/api/demo/analyze' and request.method not in ('GET', 'HEAD', 'OPTIONS'):
        return JSONResponse({'detail': 'Personal-data endpoints disabled. Authentication and private storage are not configured.'}, status_code=403, headers={'Cache-Control': 'no-store'})
    if request.url.path == '/api/demo/analyze' and request.method == 'POST':
        body = bytearray()
        async for chunk in request.stream():
            body.extend(chunk)
            if len(body) > 2048:
                return JSONResponse({'detail': 'Demo request exceeds 2 KiB'}, status_code=413)
        request._body = bytes(body)
    response = await call_next(request)
    response.headers['Cache-Control'] = 'no-store'
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['Referrer-Policy'] = 'no-referrer'
    return response

@app.get('/api/health')
def health():
    return {'status': 'ok', 'mode': 'synthetic-demo', 'uploads_enabled': False, 'authentication_configured': False}

@app.get('/api/demo/profile')
def profile():
    return DEMO

@app.post('/api/demo/analyze')
def demo(req: DemoRequest):
    return analyze(req)

@app.api_route('/api/upload', methods=['GET', 'POST'])
@app.api_route('/api/private/{path:path}', methods=['GET', 'POST', 'DELETE', 'PUT'])
def disabled(path: str = ''):
    return JSONResponse({'detail': 'Real CV handling disabled until authentication, authorization and private storage are implemented.'}, status_code=403)
