import asyncio
from fastmcp import Client
from fastmcp.client.logging import LogMessage

# 로그 핸들러 추가
async def log_handler(msg: LogMessage):
    print(f"[SERVER {msg.level.upper()}] {msg.data}")

async def main():
    # Client 생성 시 log_handler 지정
    async with Client("server_context.py", log_handler=log_handler) as client:
        print("connected:", client.is_connected())
        result1 = await client.call_tool("analyze_numbers", {"numbers": [1, 2, 3, 4, 5]})
        print("analyze_numbers result:", result1)
        print(('-' * 20))
        result2 = await client.call_tool("analyze_numbers", {"numbers": []})  # ctx.warning 을 테스트하기 위해 빈 리스트 전달
        print("analyze_numbers result:", result2)

if __name__ == "__main__":
    asyncio.run(main())