import uvicorn
import httpx
from fastapi import FastAPI, APIRouter, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(
    title="API Gateway",
    description="마이크로서비스 API Gateway",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 메인 라우터
@app.get("/")
async def read_root():
    return {"message": "Hello, World!", "status": "Gateway running"}

# Chatbot 서비스 프록시
@app.api_route("/chatbot/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
@app.api_route("/chatbot", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_chatbot(request: Request, path: str = ""):
    """Chatbot 서비스로 요청 프록시"""
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            url = f"http://chatbotservice:9001/chatbot/{path}" if path else "http://chatbotservice:9001/chatbot/"
            body = await request.body()
            response = await client.request(
                method=request.method,
                url=url,
                headers=dict(request.headers),
                params=request.query_params,
                content=body,
            )
            return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.TimeoutException:
        return JSONResponse(content={"error": "Service timeout"}, status_code=504)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

# Clawler 서비스 프록시
@app.api_route("/clawler/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
@app.api_route("/clawler", methods=["GET", "POST", "PUT", "DELETE"])
async def proxy_clawler(request: Request, path: str = ""):
    """Clawler 서비스로 요청 프록시"""
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:  # 크롤링은 시간이 오래 걸릴 수 있으므로 60초
            url = f"http://clawlerservice:9002/clawler/{path}" if path else "http://clawlerservice:9002/clawler/"
            response = await client.request(
                method=request.method,
                url=url,
                headers=dict(request.headers),
                params=request.query_params,
            )
            return JSONResponse(content=response.json(), status_code=response.status_code)
    except httpx.TimeoutException:
        return JSONResponse(content={"error": "Crawling service timeout"}, status_code=504)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=9000, reload=True)
