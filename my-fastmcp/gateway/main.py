"""
Gateway 엔트리포인트

uvicorn gateway.main:app 또는 python -m gateway.main으로 실행 가능
"""

# FastAPI app을 re-export하여 uvicorn에서 직접 사용 가능
from gateway.app.main import app

try:
    import uvicorn
except ImportError:
    uvicorn = None


def main():
    """Run the Gateway with uvicorn."""
    if uvicorn is None:
        raise RuntimeError("uvicorn is not installed. Run: pip install uvicorn")
    
    uvicorn.run(
        "gateway.main:app",
        host="0.0.0.0",
        port=9000,
        reload=True
    )


if __name__ == "__main__":
    main()
