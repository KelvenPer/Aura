from workers import WorkerEntrypoint, Response
from main import app  # Importa sua aplicação FastAPI
import json
import asyncio

# --- ADAPTADOR: Ponte entre Cloudflare e FastAPI ---
async def dispatch_fastapi(request, env):
    # 1. Injeta o banco de dados na aplicação para uso nas rotas
    # Você poderá acessar no FastAPI via: request.app.state.db
    app.state.db = env.DB
    
    # 2. Prepara o ambiente (Scope) do ASGI
    body = await request.bytes()
    scope = {
        'type': 'http',
        'http_version': '1.1',
        'method': request.method,
        'path': request.url.split(request.headers.get("host", ""))[1].split("?")[0] if "http" in request.url else request.url,
        'raw_path': request.url.encode(),
        'query_string': request.url.split("?")[1].encode() if "?" in request.url else b'',
        'headers': [[k.lower().encode(), v.encode()] for k, v in request.headers.items()],
    }

    # 3. Captura a resposta do FastAPI
    response_data = {}
    
    async def receive():
        return {'type': 'http.request', 'body': body, 'more_body': False}

    async def send(message):
        if message['type'] == 'http.response.start':
            response_data['status'] = message['status']
            response_data['headers'] = message.get('headers', [])
        elif message['type'] == 'http.response.body':
            response_data['body'] = message.get('body', b'')

    # 4. Executa o FastAPI
    await app(scope, receive, send)

    # 5. Devolve a resposta para o Cloudflare
    # Converte headers bytes para string
    headers_dict = {k.decode(): v.decode() for k, v in response_data['headers']}
    
    return Response.new(
        response_data.get('body', b''),
        status=response_data.get('status', 200),
        headers=headers_dict
    )

# --- WORKER: Ponto de Entrada ---
class Default(WorkerEntrypoint):
    async def fetch(self, request):
        try:
            # Envia tudo para o FastAPI tratar
            return await dispatch_fastapi(request, self.env)
        except Exception as e:
            return Response.json({"error": str(e)}, status=500)
