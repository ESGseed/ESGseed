"""
FastMCP Client 예제

이 파일은 FastMCP 서버에 연결하여 도구를 호출하는 클라이언트입니다.
server.py와 같은 프로세스 공간에서 in-memory로 통신하거나,
STDIO/HTTP를 통해 외부 서버와 통신할 수 있습니다.

참고: https://github.com/jlowin/fastmcp/blob/main/docs/clients/client.mdx
"""
import asyncio
from fastmcp import Client

# Client 생성 방법:
# 1. 로컬 스크립트 (STDIO): Client("server.py")
# 2. HTTP/SSE 엔드포인트: Client("http://localhost:8000/sse")
# 3. In-memory (테스트용): Client(mcp_instance)
client = Client("server.py")

async def main():
    """클라이언트 메인 함수
    
    async with 블록을 사용하여 서버와의 연결을 관리합니다.
    블록 진입 시 자동으로 연결되고, 종료 시 자동으로 연결이 정리됩니다.
    """
    async with client:
        # 연결 상태 확인
        print(f"Client connected: {client.is_connected()}")

        # 서버에서 사용 가능한 모든 도구 목록 가져오기
        # list[mcp.types.Tool] 형태로 반환됨
        tools = await client.list_tools()
        print(f"Available tools: {tools}")

        # 특정 도구 호출
        # call_tool(name, arguments)는 CallToolResult를 반환합니다.
        # - result.data: 역직렬화된 반환값
        # - result.content: MCP 프로토콜의 원본 content 블록
        # - result.is_error: 에러 발생 여부
        if any(tool.name == "multiply" for tool in tools):
            result = await client.call_tool("multiply", {"a":3, "b":7})
            print(f"multiply result: {result}")

    # async with 블록을 벗어나면 자동으로 연결이 해제됨
    print(f"client connected: {client.is_connected()}")

if __name__ == "__main__":
    # asyncio.run()으로 비동기 main 함수 실행
    asyncio.run(main())