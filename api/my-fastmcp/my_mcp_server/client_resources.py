"""
FastMCP Client - Resource 예제

이 파일은 FastMCP 서버의 리소스(Resource) 기능을 사용하는 클라이언트입니다.
리소스는 서버가 제공하는 정적/동적 데이터(파일, 설정, API 응답 등)입니다.

FastMCP에서 리소스는 세 가지 형태로 제공됩니다:
1. 정적 리소스: 고정된 URI로 접근 (예: resource://greeting)
2. JSON 리소스: 구조화된 데이터 제공 (예: data://config)
3. 템플릿 리소스: URI에 파라미터를 포함 (예: repos://{owner}/{repo}/info)

참고: https://github.com/jlowin/fastmcp/blob/main/docs/clients/resources.mdx
"""
import asyncio
import json
from fastmcp import Client

# Client 생성: 로컬 스크립트를 STDIO transport로 실행
# server_resources.py가 자동으로 서브프로세스로 실행되어 통신합니다
client = Client("server_resources.py")

async def main():
    """리소스 클라이언트 메인 함수
    
    async with 블록을 사용하여 서버와의 연결을 관리합니다.
    블록 진입 시 자동으로 연결되고, 종료 시 자동으로 연결이 정리됩니다.
    """
    async with client:
        # 연결 상태 확인
        print("connected:", client.is_connected())

        # 서버에서 사용 가능한 정적 리소스 목록 가져오기
        # 반환 타입: list[mcp.types.Resource]
        # 각 Resource 객체는 uri, name, description, mimeType 등의 속성을 가집니다
        resources = await client.list_resources()
        print("resources:", [r.uri for r in resources])
        
        # 서버에서 사용 가능한 리소스 템플릿 목록 가져오기
        # 템플릿은 동적 파라미터를 받는 리소스 패턴입니다
        # 반환 타입: list[mcp.types.ResourceTemplate]
        templates = await client.list_resource_templates()
        print("templates:", [t.uriTemplate for t in templates])

        # 1) 단순 텍스트 리소스 읽기
        # read_resource()는 list[TextResourceContents | BlobResourceContents]를 반환합니다
        # content[0].text: 텍스트 리소스의 내용
        # content[0].blob: 바이너리 리소스의 내용 (base64 인코딩)
        greet = await client.read_resource("resource://greeting")
        print("greeting:", greet[0].text)
        
        # 2) JSON 리소스 읽기 및 파싱
        # JSON 리소스는 text 속성에 JSON 문자열로 저장되어 있으므로
        # json.loads()를 사용하여 파싱해야 합니다
        cfg_raw = await client.read_resource("data://config")
        cfg = json.loads(cfg_raw[0].text)
        print("config.version:", cfg["version"])
        
        # 3) 파라미터가 있는 템플릿 리소스 읽기
        # URI 템플릿의 {owner}, {repo} 자리에 실제 값을 넣어 호출
        # 예: "repos://openai/gpt-4/info" → owner="openai", repo="gpt-4"
        repo_raw = await client.read_resource("repos://openai/gpt-4/info")
        repo_info = json.loads(repo_raw[0].text)
        print("stars:", repo_info["stars"])

    # async with 블록을 벗어나면 자동으로 연결 해제
    print("connected:", client.is_connected())

if __name__ == "__main__":
    # asyncio.run()으로 비동기 main 함수 실행
    asyncio.run(main())