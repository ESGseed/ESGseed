from fastapi import FastAPI, APIRouter
import uvicorn

# FastAPI 앱 생성 (독립 실행용)
app = FastAPI(
    title="Clawler Service API",
    description="Clawler 서비스 API",
    version="1.0.0"
)

# 루트 경로 엔드포인트 (기본 화면)
@app.get("/")
async def root():
    """
    Clawler 서비스 기본 엔드포인트
    """
    return {
        "service": "clawler-service",
        "message": "Clawler service is running",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
async def health_check():
    """
    Clawler 서비스 헬스 체크
    """
    return {"status": "healthy", "service": "clawler-service"}

# 서브라우터 생성
clawler_router = APIRouter(prefix="/clawler", tags=["clawler"])

@clawler_router.get("/")
async def read_clawler():
    """
    Clawler 서비스 기본 엔드포인트
    """
    return {"service": "clawler-service", "message": "Clawler service is running"}

@clawler_router.get("/health")
async def clawler_health_check():
    """
    Clawler 서비스 헬스 체크
    """
    return {"status": "healthy", "service": "clawler-service"}

# 라우터를 앱에 포함
app.include_router(clawler_router)

# 독립 실행용 (선택사항)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9001)

