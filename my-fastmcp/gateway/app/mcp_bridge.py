"""
MCP Bridge - Gateway에서 FastMCP Server로 연결하는 브리지

FastMCP Client를 사용하여 MCP Server(http://localhost:8000/mcp)에 연결하고,
Frontend용 REST API 엔드포인트를 제공합니다.
"""

from __future__ import annotations

from typing import List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from fastmcp import Client

# MCP Server 엔드포인트 (Streamable HTTP)
MCP_SERVER_URL = "http://localhost:8000/mcp"

router = APIRouter(prefix="/mcp", tags=["mcp"])


# =========================
# Request/Response 스키마
# =========================

class MapRequest(BaseModel):
    raw_text: str
    industry: str
    jurisdiction: str = "IFRS"


class ValidateRequest(BaseModel):
    codes: List[str]
    draft_text: str
    industry: str = "은행"


class ExpertPromptRequest(BaseModel):
    raw_text: str
    industry: str
    jurisdiction: str = "IFRS"


class DraftRequest(BaseModel):
    codes: List[str]
    company_profile: str
    source_text: str


class MappingCandidate(BaseModel):
    code: str
    reason: str


class MappingResult(BaseModel):
    candidates: List[MappingCandidate]
    coverage_comment: str


class ValidationIssue(BaseModel):
    code: str
    severity: str
    title: str
    detail: str
    suggestion: str


class ValidationResult(BaseModel):
    overall_status: str
    issues: List[ValidationIssue]


# =========================
# MCP Client 헬퍼 함수
# =========================

async def call_mcp_tool(tool_name: str, arguments: dict) -> dict:
    """
    MCP Server의 도구를 호출합니다.
    
    Args:
        tool_name: 호출할 도구 이름
        arguments: 도구에 전달할 인자
        
    Returns:
        도구 실행 결과
    """
    client = Client(MCP_SERVER_URL)
    
    try:
        async with client:
            result = await client.call_tool(tool_name, arguments)
            
            if result.is_error:
                raise HTTPException(
                    status_code=500,
                    detail=f"MCP tool error: {result.content}"
                )
            
            return result.data
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to call MCP Server: {str(exc)}"
        ) from exc


# =========================
# REST API 엔드포인트
# =========================

@router.post("/map", response_model=MappingResult)
async def map_to_ifrs_endpoint(payload: MapRequest) -> MappingResult:
    """
    TCFD/ESG 텍스트를 IFRS S2 요구사항에 매핑합니다.
    """
    result = await call_mcp_tool("map_to_ifrs_s2", {
        "raw_text": payload.raw_text,
        "industry": payload.industry,
        "jurisdiction": payload.jurisdiction,
    })
    
    return MappingResult(**result)


@router.post("/validate", response_model=ValidationResult)
async def validate_endpoint(payload: ValidateRequest) -> ValidationResult:
    """
    작성된 공시 문단이 IFRS S2 요구사항을 충족하는지 검증합니다.
    """
    result = await call_mcp_tool("validate_disclosure", {
        "codes": payload.codes,
        "draft_text": payload.draft_text,
        "industry": payload.industry,
    })
    
    return ValidationResult(**result)


@router.post("/prompts/map-expert")
async def expert_prompt_endpoint(payload: ExpertPromptRequest) -> dict:
    """
    IFRS S2 전문가 역할의 LLM 프롬프트를 생성합니다.
    """
    # 프롬프트는 MCP prompt 기능을 사용
    client = Client(MCP_SERVER_URL)
    
    try:
        async with client:
            prompts = await client.list_prompts()
            
            # map_to_ifrs_s2_expert 프롬프트 찾기
            for prompt in prompts:
                if prompt.name == "map_to_ifrs_s2_expert":
                    result = await client.get_prompt(
                        prompt.name,
                        arguments={
                            "raw_text": payload.raw_text,
                            "industry": payload.industry,
                            "jurisdiction": payload.jurisdiction,
                        }
                    )
                    # 프롬프트 메시지 텍스트 추출
                    prompt_text = ""
                    for msg in result.messages:
                        if hasattr(msg, 'content'):
                            if isinstance(msg.content, str):
                                prompt_text += msg.content
                            elif hasattr(msg.content, 'text'):
                                prompt_text += msg.content.text
                    return {"prompt": prompt_text}
            
            raise HTTPException(
                status_code=404,
                detail="Prompt 'map_to_ifrs_s2_expert' not found"
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get prompt: {str(exc)}"
        ) from exc


@router.post("/prompts/draft")
async def draft_prompt_endpoint(payload: DraftRequest) -> dict:
    """
    IFRS S2 공시 문단 초안 생성 프롬프트를 생성합니다.
    """
    client = Client(MCP_SERVER_URL)
    
    try:
        async with client:
            prompts = await client.list_prompts()
            
            # draft_ifrs_s2_disclosure 프롬프트 찾기
            for prompt in prompts:
                if prompt.name == "draft_ifrs_s2_disclosure":
                    result = await client.get_prompt(
                        prompt.name,
                        arguments={
                            "codes": payload.codes,
                            "company_profile": payload.company_profile,
                            "source_text": payload.source_text,
                        }
                    )
                    # 프롬프트 메시지 텍스트 추출
                    prompt_text = ""
                    for msg in result.messages:
                        if hasattr(msg, 'content'):
                            if isinstance(msg.content, str):
                                prompt_text += msg.content
                            elif hasattr(msg.content, 'text'):
                                prompt_text += msg.content.text
                    return {"prompt": prompt_text}
            
            raise HTTPException(
                status_code=404,
                detail="Prompt 'draft_ifrs_s2_disclosure' not found"
            )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get prompt: {str(exc)}"
        ) from exc


@router.get("/health")
async def health_check() -> dict:
    """
    MCP Server 연결 상태를 확인합니다.
    """
    client = Client(MCP_SERVER_URL)
    
    try:
        async with client:
            tools = await client.list_tools()
            return {
                "status": "healthy",
                "mcp_server": MCP_SERVER_URL,
                "available_tools": [tool.name for tool in tools],
            }
    except Exception as exc:
        return {
            "status": "unhealthy",
            "mcp_server": MCP_SERVER_URL,
            "error": str(exc),
        }

