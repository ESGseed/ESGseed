from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
from pathlib import Path

# MCP Bridge 라우터 import
from .mcp_bridge import router as mcp_router

# 서브라우터 import를 위한 경로 추가
# Docker 컨테이너 내부에서는 /app/services에 있고, 로컬에서는 상대 경로 사용
base_path = Path(__file__).parent
if (base_path / "services").exists():
    # Docker 컨테이너 내부 경로
    services_base = base_path / "services"
else:
    # 로컬 개발 환경 경로
    services_base = base_path.parent.parent / "services"

clawler_path = services_base / "clawler_serice" / "app"
agent_path = services_base / "agent_service" / "app"

# Clawler 라우터 import (선택적 - 경로가 존재하는 경우에만)
clawler_router = None
agent_router = None

if clawler_path.exists():
    sys.path.insert(0, str(clawler_path))
    import importlib.util
    spec_clawler = importlib.util.spec_from_file_location("clawler_main", clawler_path / "main.py")
    if spec_clawler and spec_clawler.loader:
        clawler_module = importlib.util.module_from_spec(spec_clawler)
        spec_clawler.loader.exec_module(clawler_module)
        clawler_router = clawler_module.clawler_router

# Agent 라우터 import (선택적 - 경로가 존재하는 경우에만)
if agent_path.exists():
    import importlib.util
    spec_agent = importlib.util.spec_from_file_location("agent_main", agent_path / "main.py")
    if spec_agent and spec_agent.loader:
        agent_module = importlib.util.module_from_spec(spec_agent)
        spec_agent.loader.exec_module(agent_module)
        agent_router = agent_module.agent_router

app = FastAPI(
    title="Gateway API",
    description="Gateway 서비스 API - MCP Bridge 포함",
    version="1.0.0"
)

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 origin 허용 (프로덕션에서는 특정 origin만 허용 권장)
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 메인 라우터 생성
main_router = APIRouter()

@main_router.get("/")
async def read_root():
    return {"message": "Hello World - Gateway API with MCP Bridge"}

# 라우터를 앱에 포함
app.include_router(main_router)

# MCP Bridge 라우터 연결 (핵심 기능)
app.include_router(mcp_router)

# 서브라우터 연결 (선택적)
if clawler_router:
    app.include_router(clawler_router)
if agent_router:
    app.include_router(agent_router)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
