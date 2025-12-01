from fastapi import FastAPI, APIRouter
import uvicorn

# FastAPI 앱 생성 (독립 실행용)
app = FastAPI(
    title="Agent Service API",
    description="Agent 서비스 API",
    version="1.0.0"
)

# 루트 경로 엔드포인트 (기본 화면)
@app.get("/")
async def root():
    """
    Agent 서비스 기본 엔드포인트
    """
    return {
        "service": "agent-service",
        "message": "Agent service is running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """
    Agent 서비스 헬스 체크
    """
    return {"status": "healthy", "service": "agent-service"}

# 서브라우터 생성
agent_router = APIRouter(prefix="/agent", tags=["agent"])

@agent_router.get("/")
async def read_agent():
    """
    Agent 서비스 기본 엔드포인트
    """
    return {"service": "agent-service", "message": "Agent service is running"}

@agent_router.get("/health")
async def agent_health_check():
    """
    Agent 서비스 헬스 체크
    """
    return {"status": "healthy", "service": "agent-service"}

# 라우터를 앱에 포함
app.include_router(agent_router)

# 독립 실행용 (선택사항)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)

