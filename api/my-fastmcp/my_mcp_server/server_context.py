import asyncio
from fastmcp import FastMCP, Context

mcp = FastMCP(name="ContextDemo")

@mcp.tool()
async def analyze_numbers(numbers: list[int], ctx: Context) -> dict:
    """숫자 리스트를 분석하며, 로그와 진행 상황을 클라이언트에 전송합니다."""
    await ctx.info(f"입력된 숫자 개수: {len(numbers)}")
    total = len(numbers)
    sum_ = 0

    for i, n in enumerate(numbers):
        await asyncio.sleep(0.2)  # 긴 작업 시뮬레이션
        sum_ += n
        # 진행률 보고 (i+1/total)
        await ctx.report_progress(progress=i+1, total=total)

    if total > 0:
        avg = sum_ / total
        await ctx.debug(f"합계={sum_}, 평균={avg:.2f}")
        return {"count": total, "sum": sum_, "average": avg}
    else:
        await ctx.warning("빈 리스트가 주어졌습니다")
        return {"error": "빈 입력값"}

if __name__ == "__main__":
    mcp.run()