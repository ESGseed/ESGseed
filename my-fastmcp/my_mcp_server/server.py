from fastmcp import FastMCP
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Literal, Optional
import re
import os
import json
from dotenv import load_dotenv
from openai import OpenAI
import logging
from typing import List, Literal, Optional, Dict  # ← Dict 추가
from dataclasses import dataclass                # ← 새로 추가

logger = logging.getLogger(__name__)

# 환경 변수 로드
load_dotenv()

# OpenAI 클라이언트 초기화
openai_client = OpenAI()
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

mcp = FastMCP(name="IFRS_S2_Navigator")

# =========================
# FastAPI REST API 래퍼
# =========================
api = FastAPI(
    title="IFRS S2 Navigator API",
    description="MCP 도구를 REST API로 직접 호출할 수 있는 래퍼",
    version="1.0.0"
)

# CORS 설정 (Frontend 직접 호출 허용)
api.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# Pydantic 모델 (응답 스키마)
# =========================

class MappingCandidate(BaseModel):
    code: str          # 예: "10", "13", "22" 등 IFRS S2 문단 번호
    reason: str        # 왜 그렇게 매핑했는지 설명
    matched_keywords: List[str] = []  # 신뢰도 계산용 - 매칭된 키워드 목록
    score: float = 0.0                # 가중치 점수


class MappingResult(BaseModel):
    candidates: List[MappingCandidate]
    coverage_comment: str   # 전체 커버리지에 대한 한 줄 코멘트
    confidence: float = 0.0  # 전체 신뢰도 (0~1)

class ValidationIssue(BaseModel):
    code: str                     # 어떤 IFRS S2 코드/섹션과 관련된 이슈인지
    severity: Literal["info", "warning", "error"]
    title: str                    # UI에 한 줄로 보여줄 제목
    detail: str                   # 왜 문제가 되는지, 어떤 부분을 보고 판단했는지
    suggestion: str               # 사용자가 무엇을 입력/수정해야 하는지


class ValidationResult(BaseModel):
    overall_status: Literal["pass", "partial", "fail"]
    issues: List[ValidationIssue]


class ChecklistItem(BaseModel):
    code: str
    title: str
    status: Literal["pass", "partial", "fail"]
    issues: List[ValidationIssue]


class SentenceSuggestion(BaseModel):
    """
    PDF 1페이지 텍스트를 문장 단위로 나눠,
    각 문장에 대해 어떤 IFRS S2 코드와 관련 있고
    어떤 정보가 부족한지를 나타내는 모델입니다.
    """
    sentence_index: int               # 페이지 내 문장 인덱스 (0부터)
    sentence_text: str                # 원문 문장
    ifrs_codes: List[str]             # 예: ["S2-5", "S2-15"] - 내부 로직용 그룹 코드
    ifrs_titles: List[str]            # 예: ["거버넌스(이사회/위원회 역할)", "기후 시나리오 분석"] - UI 표시용 한글 제목
    overall_status: Literal["pass", "partial", "fail"]
    issues: List[ValidationIssue]     # 이 문장에 대해 필요한 수정/추가 정보



class DemoAnalysisResponse(BaseModel):
    pdf_text: str
    pdf_meta: dict  # filename, page_index
    checklist: List[ChecklistItem]
    sentence_suggestions: List[SentenceSuggestion]  # 👈 추가


class ElementCheckResult(BaseModel):
    key: str
    label: str
    present: bool
    reason: str


class EnhanceParagraphRequest(BaseModel):
    paragraph: str
    ifrs_code: str   # 예: "14", "22–23,25", "29(a)–29(c)"
    industry: str = "IT서비스"   # 지금은 사용 안 하지만 확장용
    user_message: Optional[str] = None   # 사용자가 채팅으로 남긴 추가 요청


class EnhanceParagraphResponse(BaseModel):
    ifrs_code: str
    ifrs_title: str
    missing_elements: List[ElementCheckResult]
    completed_paragraph: str


# =========================
# IFRS S2 그룹 단일 정의 (도메인 설정)
#  - 이곳만 수정하면 체크리스트/검증/맵핑에서 공통으로 사용 가능
# =========================

# 예: "S2-5" = 거버넌스 그룹, "S2-15" = 시나리오 분석, "S2-9" = 지표·목표·배출량
IFRS_S2_GROUPS: Dict[str, Dict[str, object]] = {
    "S2-5": {
        "title": "거버넌스(이사회/위원회 역할)",
        # 이 그룹이 주로 커버하는 IFRS S2 단락들 (RULES/맵핑과 연동할 때 사용)
        "paragraphs": ["5–7"],
        "essential": True,
    },
    "S2-15": {
        "title": "기후 시나리오 분석",
        "paragraphs": ["22–23", "25"],
        "essential": True,
    },
    "S2-9": {
        "title": "지표·목표 및 배출량(Scope 1·2·3)",
        "paragraphs": ["29(a)–29(c)", "33–36"],
        "essential": True,
    },
    # 나중에 필요하면 여기만 추가하면 됨:
    # "S2-8": { "title": "...", "paragraphs": [...], "essential": False },
}

# ✅ 기존 체크리스트용 ESSENTIAL_CODES는 IFRS_S2_GROUPS에서 자동 생성
ESSENTIAL_CODES = [
    (code, meta["title"])
    for code, meta in IFRS_S2_GROUPS.items()
    if meta.get("essential", False)
]


# (선택) RULES → S2 그룹 코드 연결에 쓸 수 있는 헬퍼
def group_code_from_paragraph_code(paragraph_code: str) -> Optional[str]:
    """
    "5–7", "22–23,25", "29(a)–29(c)" 같은 단락 코드에서
    S2-5 / S2-15 / S2-9 같은 그룹 코드를 찾아줍니다.
    (tool1에서 TCFD 문장을 그룹별로 묶고 싶을 때 사용)
    """
    normalized = paragraph_code.replace(" ", "")
    for group_code, meta in IFRS_S2_GROUPS.items():
        for p in meta.get("paragraphs", []):
            if normalized in p.replace(" ", "") or p.replace(" ", "") in normalized:
                return group_code
    return None


def display_group_name(group_code: str) -> str:
    """
    그룹 코드(예: "S2-9", "S2-15")를 사용자 친화적인 한글 제목으로 변환합니다.
    매칭되지 않으면 원본 코드를 반환합니다.
    
    이 함수는 UI 표시용으로 사용되며, 내부 로직에서는 그룹 코드를 그대로 사용합니다.
    """
    if group_code in IFRS_S2_GROUPS:
        return IFRS_S2_GROUPS[group_code]["title"]
    return group_code


# =========================
# 간단한 키워드 → IFRS S2 코드 룰
# (데모/프로토타입용)
# =========================

RULES = [
    # (키워드 리스트, 코드, 이유)
    (["governance", "거버넌스", "이사회",
    "ESG위원회", "ESG 위원회", "ESG 협의체",
    "기후 관련 위험 및 기회에 대한 이사회의 감독",
    "기후 관련 위험 및 기회에 대한 경영진의 책임"],
    "5–7",
    "기후 관련 리스크와 기회를 감독·관리하는 이사회/위원회/경영진의 역할을 설명하는 내용으로 보입니다."),


    (["기후 리스크 관리", "기후 관련 리스크 관리", "기후 관련 위험 관리",
    "climate risk management",
    "기후 리스크 식별", "기후 관련 위험 식별",
    "기후 관련 리스크 평가", "기후 관련 위험 평가"],
    "24–25",
    "기후 관련 리스크를 식별·평가·우선순위화·모니터링하는 프로세스를 설명하는 내용으로 보입니다."),

    (["기후 관련 비즈니스 기회", "기후 관련 기회", "climate-related opportunity",
    "기후 관련 비즈니스", "저탄소 솔루션", "저탄소 서비스", "저탄소 물류"],
    "10(a)",
    "기후 관련 비즈니스 기회(저탄소 솔루션·서비스 등)를 설명하는 내용으로 보입니다."),

    (["climate risk", "climate-related risk", "climate-related risks",
    "기후 리스크", "기후 관련 리스크", "기후변화 리스크",
    "기후 관련 위험", "전환 리스크", "물리적 리스크",
    "탄소세", "탄소배출권", "배출권"],
    "10(b)",
    "기후 관련 리스크(전환/물리적, 탄소세·배출권 등)가 기업 전망과 재무에 미치는 영향을 다루는 내용으로 보입니다."),


    (["value chain", "가치사슬", "supply chain", "밸류체인",
    "공급망", "협력사", "협력회사", "업스트림 운송", "다운스트림"],
    "13",
    "기후 관련 리스크와 기회가 비즈니스 모델과 가치사슬(공급망, 협력사 등)에 미치는 영향을 설명하는 내용으로 보입니다."),

    (["기후변화 대응 전략", "기후변화 대응", "기후 관련 대응 방안",
    "탄소중립", "탄소 중립", "Net Zero Roadmap", "넷제로 로드맵",
    "온실가스 감축 활동", "재생에너지 확대", "전환 계획", "transition plan"],
    "14",
    "기후 관련 리스크와 기회에 대응하기 위한 전략·전환 계획(transition plan)과 주요 실행 과제를 설명하는 내용으로 보입니다."),



    (["재무영향", "재무 영향", "재무적 영향",
    "매출", "영업이익", "비용", "손익",
    "현금흐름", "cash flow", "cash flows",
    "재무상태표", "손익계산서"],
    "15–16",
    "기후 관련 리스크와 기회가 재무상태·재무성과·현금흐름에 미치는 현재 및 예상 재무적 영향을 설명하는 내용으로 보입니다."),


    (["기후 시나리오", "시나리오 분석", "scenario analysis",
    "1.5℃ 시나리오", "2℃ 시나리오", "RCP", "탄소가격 시나리오"],
    "22–23,25",
    "기후 관련 시나리오 분석과 그 결과를 활용한 기후 탄력성 평가 및 리스크 식별을 설명하는 내용으로 보입니다."),


    (["감축 목표", "온실가스 감축", "배출량 감축 목표",
    "net zero", "Net Zero", "넷제로",
    "재생에너지 100", "재생에너지 100%"],
    "33–36",
    "온실가스 배출 및 에너지 전환과 관련된 정량적 목표와 그 이행 현황을 설명하는 내용으로 보입니다."),


    (["Scope 1", "Scope 2", "Scope 3", "scope 1", "scope 2", "scope 3",
    "스코프1", "스코프2", "스코프3",
    "tCO2eq", "온실가스 배출량"],
    "29(a)–29(c)",
    "Scope 1/2/3 온실가스 배출량 등 핵심 배출 지표를 공시하는 내용으로 보입니다."),
]

def _has_number(text: str) -> bool:
    """정량 정보(숫자)가 들어있는지 간단히 체크."""
    return bool(re.search(r"\d", text))


def _calculate_confidence(result: MappingResult) -> float:
    """
    MappingResult의 신뢰도를 계산합니다.
    
    - "(검토 필요)" 결과면 0.0
    - 키워드 개수 + 후보 수에 따라 0~1 사이 값 반환
    """
    if not result.candidates:
        return 0.0
    
    # "(검토 필요)"인 경우
    if result.candidates[0].code == "(검토 필요)":
        return 0.0
    
    # 총 매칭 키워드 수
    total_keywords = sum(len(c.matched_keywords) for c in result.candidates)
    
    # 후보 수
    num_candidates = len(result.candidates)
    
    # 최고 점수
    max_score = max(c.score for c in result.candidates) if result.candidates else 0.0
    
    # 신뢰도 계산 (간단한 휴리스틱)
    # - 키워드 3개 이상이면 기본 0.5
    # - 키워드 5개 이상이면 0.7
    # - 키워드 7개 이상이면 0.85
    # - 후보가 2개 이상이면 +0.1
    if total_keywords >= 7:
        confidence = 0.85
    elif total_keywords >= 5:
        confidence = 0.7
    elif total_keywords >= 3:
        confidence = 0.5
    elif total_keywords >= 1:
        confidence = 0.3
    else:
        confidence = 0.0
    
    # 후보가 2개 이상이면 보너스
    if num_candidates >= 2:
        confidence = min(1.0, confidence + 0.1)
    
    return confidence


def _rule_based_mapping(raw_text: str) -> MappingResult:
    text_lower = raw_text.lower()

    # code별로 매칭된 키워드를 모아두기
    hits_by_code: dict[str, dict] = {}
    for keywords, code, reason in RULES:
        for kw in keywords:
            if kw.lower() in text_lower:
                if code not in hits_by_code:
                    hits_by_code[code] = {
                        "reason": reason,
                        "keywords": set(),
                    }
                hits_by_code[code]["keywords"].add(kw)
                break  # 같은 룰에서 키워드는 하나만 잡고 다음 룰로

    candidates: List[MappingCandidate] = []

    if not hits_by_code:
        candidates.append(
            MappingCandidate(
                code="(검토 필요)",
                reason=(
                    "텍스트에서 뚜렷한 IFRS S2 키워드를 찾기 어려워 수동 검토가 필요합니다."
                ),
                matched_keywords=[],
                score=0.0,
            )
        )
        coverage_comment = (
            "명확한 키워드가 없어 자동 매핑이 어렵습니다. 해당 단락을 수동으로 검토해 "
            "어느 섹션(거버넌스/전략/리스크관리/지표와 목표)에 가까운지 판단하는 것이 좋습니다."
        )
    else:
        for code, data in hits_by_code.items():
            matched_list = sorted(data["keywords"])
            # 매칭된 키워드를 reason 뒤에 붙여서 설명력 강화
            detailed_reason = (
                f"{data['reason']} "
                f"(매칭 키워드: {', '.join(matched_list)})"
            )
            # 점수는 키워드 수에 비례
            score = len(matched_list) * 0.2
            candidates.append(MappingCandidate(
                code=code, 
                reason=detailed_reason,
                matched_keywords=matched_list,
                score=min(1.0, score),
            ))

        coverage_comment = (
            "텍스트의 주요 키워드를 기준으로 IFRS S2 관련 문단 후보를 제안했습니다. "
            "실제 보고서 작성 시에는 IFRS S2 원문과 기업 상황을 함께 고려해 최종 매핑을 검토·수정해야 합니다."
        )

    result = MappingResult(candidates=candidates, coverage_comment=coverage_comment)
    result.confidence = _calculate_confidence(result)
    return result


def _build_llm_prompt(raw_text: str, industry: str, jurisdiction: str, rule_hints: Optional[MappingResult] = None) -> str:
    """
    LLM에게 전달할 프롬프트를 생성합니다.
    accurate 모드에서는 룰 기반 결과를 힌트로 포함합니다.
    """
    base_prompt = (
        "당신은 IFRS S2 기후 관련 공시 전문가이며, TCFD 권고안과 IFRS S2의 차이를 잘 알고 있습니다.\n"
        "다음 텍스트를 읽고 IFRS S2 기준에 따라 어떤 문단(또는 문단 범위)에 해당하는지 분석해 주세요.\n\n"
        f"[업종]\n{industry}\n\n"
        f"[적용 기준]\n{jurisdiction}\n\n"
        f"[분석 대상 텍스트]\n{raw_text}\n\n"
    )
    
    # 룰 기반 힌트가 있으면 추가
    if rule_hints and rule_hints.candidates and rule_hints.candidates[0].code != "(검토 필요)":
        hint_text = "[참고: 키워드 기반 분석 결과]\n"
        for c in rule_hints.candidates:
            hint_text += f"- {c.code}: {', '.join(c.matched_keywords)}\n"
        hint_text += "\n위 결과를 참고하되, 최종 판단은 텍스트 전체 맥락을 기반으로 해주세요.\n\n"
        base_prompt += hint_text
    
    base_prompt += (
        "아래 JSON 형식으로만 답변해 주세요.\n"
        "```json\n"
        "{\n"
        '  "candidates": [\n'
        '    {\n'
        '      "code": "문단 또는 문단 범위 (예: \\"10\\", \\"13–14\\", \\"22–23\\")",\n'
        '      "reason": "이 텍스트가 해당 문단(들)에 해당한다고 판단한 이유를 한국어로 자세히 설명"\n'
        "    }\n"
        "  ],\n"
        '  "coverage_comment": "전체적으로 이 텍스트가 IFRS S2 어디를 어느 정도 커버하는지 요약 설명"\n'
        "}\n"
        "```\n"
        "반드시 위 JSON 형식을 지키고, 불필요한 설명 문장은 JSON 외부에 쓰지 마세요."
    )
    
    return base_prompt


def _llm_based_mapping(
    raw_text: str, 
    industry: str, 
    jurisdiction: str,
    rule_hints: Optional[MappingResult] = None
) -> MappingResult:
    """
    OpenAI API를 사용한 LLM 기반 매핑.
    accurate 모드에서는 룰 기반 결과를 힌트로 활용합니다.
    """
    prompt = _build_llm_prompt(raw_text, industry, jurisdiction, rule_hints)
    
    try:
        # OpenAI API 호출
        response = openai_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {"role": "system", "content": "당신은 IFRS S2 기후 관련 공시 전문가입니다. 반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        
        content = response.choices[0].message.content
        
        # 응답이 없는 경우 폴백
        if not content or not content.strip():
            print("LLM 응답이 비어있습니다. 룰 기반 결과로 폴백합니다.")
            if rule_hints:
                return rule_hints
            return _rule_based_mapping(raw_text)
        
        # JSON 파싱 (```json ... ``` 블록 추출)
        json_match = re.search(r'```json\s*([\s\S]*?)\s*```', content)
        if json_match:
            json_str = json_match.group(1)
        else:
            # { 로 시작하는 JSON 찾기
            json_match2 = re.search(r'\{[\s\S]*\}', content)
            if json_match2:
                json_str = json_match2.group(0)
            else:
                # ```json 없이 바로 JSON인 경우
                json_str = content.strip()
        
        if not json_str or not json_str.strip():
            print("JSON 추출 실패. 룰 기반 결과로 폴백합니다.")
            if rule_hints:
                return rule_hints
            return _rule_based_mapping(raw_text)
        
        data = json.loads(json_str)
        
        # MappingResult로 변환
        candidates = []
        for c in data.get("candidates", []):
            candidates.append(MappingCandidate(
                code=c.get("code", ""),
                reason=c.get("reason", ""),
                matched_keywords=[],  # LLM은 키워드 매칭 없음
                score=0.9,  # LLM 결과는 높은 점수
            ))
        
        if not candidates:
            print("LLM 결과에 후보가 없습니다. 룰 기반 결과로 폴백합니다.")
            if rule_hints:
                return rule_hints
            return _rule_based_mapping(raw_text)
        
        result = MappingResult(
            candidates=candidates,
            coverage_comment=data.get("coverage_comment", "LLM 분석 완료"),
            confidence=0.9,  # LLM 결과는 높은 신뢰도
        )
        
        print(f"LLM 분석 완료: {len(candidates)}개 후보")
        return result
        
    except Exception as e:
        # 에러 발생 시 폴백: 룰 기반 결과 반환 또는 에러 메시지
        print(f"LLM API 호출 오류: {e}")
        if rule_hints:
            return rule_hints
        return MappingResult(
            candidates=[MappingCandidate(
                code="(LLM 오류)",
                reason=f"LLM API 호출 중 오류가 발생했습니다: {str(e)}",
                matched_keywords=[],
                score=0.0,
            )],
            coverage_comment="LLM 분석에 실패했습니다. 다시 시도해 주세요.",
            confidence=0.0,
        )


def _hybrid_mapping(
    raw_text: str, 
    industry: str, 
    jurisdiction: str,
    mode: Literal["fast", "accurate", "auto"] = "auto"
) -> MappingResult:
    """
    하이브리드 매핑 함수.
    
    - fast: 룰 기반만 사용 (즉시 응답)
    - accurate: 룰 기반 힌트 + LLM 최종 결정
    - auto: 룰 기반 먼저 → 신뢰도 0.7 미만이면 LLM 호출
    """
    # 1단계: 항상 룰 기반 매핑 먼저 실행
    rule_result = _rule_based_mapping(raw_text)
    
    if mode == "fast":
        # fast 모드: 룰 기반 결과만 반환
        return rule_result
    
    elif mode == "accurate":
        # accurate 모드: 룰 기반 결과를 힌트로 LLM에게 전달
        return _llm_based_mapping(raw_text, industry, jurisdiction, rule_hints=rule_result)
    
    else:  # auto 모드
        # 신뢰도가 0.7 미만이면 LLM 호출
        if rule_result.confidence < 0.7:
            return _llm_based_mapping(raw_text, industry, jurisdiction, rule_hints=rule_result)
        return rule_result


# =========================
# TOOL 1: TCFD → IFRS-S2 매핑 (룰 기반 버전)
# =========================

@mcp.tool
def map_to_ifrs_s2(raw_text: str, industry: str, jurisdiction: str = "IFRS") -> MappingResult:
    """
    TCFD/ESG 텍스트를 IFRS S2 요구사항 코드(문단 범위)에 '대략적으로' 매핑합니다.
    - 지금은 키워드 기반 간단 룰이 들어가 있고,
      나중에 필요하면 LLM 기반/룰 보강으로 확장할 수 있습니다.

    parameters:
        raw_text: TCFD 보고서나 ESG 보고서의 특정 단락/섹션 텍스트
        industry: 업종 (예: "은행", "제조", "전력" 등)  — 현재 룰에서는 참고용(확장 포인트)
        jurisdiction: "IFRS", "K-IFRS", "JP-IFRS" 등 문자열 — 현재 룰에서는 참고용
    """
    return _rule_based_mapping(raw_text)


# =========================
# PROMPT 1: LLM에게 정교한 매핑을 맡기는 버전
# (원하면 이 프롬프트를 직접 호출해서 JSON 출력 받기)
# =========================

@mcp.prompt
def map_to_ifrs_s2_expert(raw_text: str, industry: str, jurisdiction: str = "IFRS") -> str:
    """
    IFRS S2 전문가 역할의 LLM에게 정교한 매핑을 요청하는 프롬프트입니다.
    출력 형식은 JSON으로 요구합니다.
    """
    return (
        "당신은 IFRS S2 기후 관련 공시 전문가이며, TCFD 권고안과 IFRS S2의 차이를 잘 알고 있습니다.\n"
        "다음 텍스트를 읽고 IFRS S2 기준에 따라 어떤 문단(또는 문단 범위)에 해당하는지 분석해 주세요.\n\n"
        f"[업종]\n{industry}\n\n"
        f"[적용 기준]\n{jurisdiction}\n\n"
        f"[분석 대상 텍스트]\n{raw_text}\n\n"
        "아래 JSON 형식으로만 답변해 주세요.\n"
        "```json\n"
        "{\n"
        '  "candidates": [\n'
        '    {\n'
        '      "code": "문단 또는 문단 범위 (예: \\"10\\", \\"13–14\\", \\"22–23\\")",\n'
        '      "reason": "이 텍스트가 해당 문단(들)에 해당한다고 판단한 이유를 한국어로 자세히 설명"\n'
        "    }\n"
        "  ],\n"
        '  "coverage_comment": "전체적으로 이 텍스트가 IFRS S2 어디를 어느 정도 커버하는지 요약 설명"\n'
        "}\n"
        "```\n"
        "반드시 위 JSON 형식을 지키고, 불필요한 설명 문장은 JSON 외부에 쓰지 마세요."
    )


# =========================
# PROMPT 2: IFRS-S2 공시 문단 초안 생성
# =========================

@mcp.prompt
def draft_ifrs_s2_disclosure(codes: List[str], company_profile: str, source_text: str) -> str:
    codes_str = ", ".join(codes)
    return (
        "당신은 IFRS S2 기후 관련 공시 전문가입니다.\n"
        "다음 정보를 기반으로, IFRS S2 요구사항을 충족하는 한국어 공시 문단 초안을 작성해 주세요.\n\n"
        f"[대상 IFRS S2 요구사항 코드]\n{codes_str}\n\n"
        "[작성 원칙]\n"
        "- 본문 텍스트에는 'IFRS S2'나 문단 번호(예: 10(a))를 직접 언급하지 말 것\n"
        "- 대신 해당 문단이 요구하는 내용(리스크/기회, 시나리오 분석, 지표와 목표 등)을 자연스럽게 서술할 것\n"
        "- 회사의 실제 상황을 반영한 것처럼 구체적으로 작성할 것\n"
        "- 가능하다면 정량적인 수치(예: 비율, 금액, 기간)를 포함할 것\n"
        "- 투자자/규제기관이 읽는 공식 보고서 문체로 작성할 것\n\n"
        f"[회사 프로필]\n{company_profile}\n\n"
        f"[현재 보유한 원문 텍스트 또는 초안]\n{source_text}\n"
    )

def _validate_disclosure_internal(codes: List[str], draft_text: str, industry: str) -> ValidationResult:
    """
    실제 검증 로직. validate_disclosure MCP 툴에서 이 함수를 호출합니다.
    지금은 룰 기반으로 간단히 체크하고, 나중에 LLM 기반으로 확장 가능.
    """
    text_lower = draft_text.lower()
    issues: List[ValidationIssue] = []

    # 1) 거버넌스(S2-5 / 10(b) 일부) 관련: 이사회/위원회 표현이 있는지
    if any("s2-5" in c.lower() or "governance" in c.lower() for c in codes):
        if ("이사회" not in draft_text
            and "위원회" not in draft_text
            and "board" not in text_lower):
            issues.append(
                ValidationIssue(
                    code="S2-5",
                    severity="warning",
                    title="이사회/위원회 책임 표현 부족",
                    detail="거버넌스 섹션인데도 이사회 또는 위원회의 역할이 명시적으로 드러나지 않습니다.",
                    suggestion="지속가능경영위원회, 리스크위원회 등 이사회 산하 위원회의 역할과 보고 라인을 문장에 추가해 주세요."
                )
            )

    # 2) 시나리오 분석(S2-15 / 22–23) 관련: '시나리오' 언급 & 어느 정도 정량성
    if any("s2-15" in c.lower() or "22" in c or "23" in c for c in codes):
        if "시나리오" not in draft_text and "scenario" not in text_lower:
            issues.append(
                ValidationIssue(
                    code="S2-15",
                    severity="error",
                    title="시나리오 분석 언급 누락",
                    detail="해당 섹션이 시나리오 분석(2℃ 시나리오 등)을 다루는 것으로 예상되지만, 텍스트에서 시나리오 분석을 명시적으로 찾기 어렵습니다.",
                    suggestion="어떤 기후 시나리오(예: NZE 2050, 2℃ 이하 시나리오)를 사용했는지와, 분석 결과를 간략히 서술해 주세요."
                )
            )
        elif not _has_number(draft_text):
            issues.append(
                ValidationIssue(
                    code="S2-15",
                    severity="warning",
                    title="시나리오 분석의 정량 정보 부족",
                    detail="시나리오 분석을 언급하고 있으나, 연도·비율·손익 영향 등 정량적인 정보가 거의 없습니다.",
                    suggestion="2050년, 2030년 등 목표 연도, 손실률/위험액과 같이 숫자로 표현되는 결과를 한두 개 이상 포함해 주세요."
                )
            )

    # 3) 지표와 목표(S2-9 / 29–36) 관련: Scope 1·2·3, 기준연도, 목표치
    if any("29" in c or "30" in c or "s2-9" in c.lower() for c in codes):
        has_scope12 = (
            "scope 1" in text_lower or "scope1" in text_lower or "스코프1" in draft_text
            or "scope 2" in text_lower or "scope2" in text_lower or "스코프2" in draft_text
        )
        has_scope3 = (
            "scope 3" in text_lower or "scope3" in text_lower or "스코프3" in draft_text
        )
        has_base_year = ("기준연도" in draft_text or "base year" in text_lower)
        has_target_number = _has_number(draft_text)

        if not has_scope12:
            issues.append(
                ValidationIssue(
                    code="S2-9",
                    severity="error",
                    title="Scope 1·2 배출량 언급 누락",
                    detail="지표와 목표 섹션인데도 Scope 1·2 온실가스 배출량 또는 이에 준하는 표현이 보이지 않습니다.",
                    suggestion="최소한 Scope 1 및 Scope 2 배출량 수준(예: tCO2e)과 관련 목표를 문단에 포함해 주세요."
                )
            )

        if not has_scope3:
            issues.append(
                ValidationIssue(
                    code="S2-9",
                    severity="warning",
                    title="Scope 3 배출 정보 미기재",
                    detail="Scope 3 배출량 또는 해당 여부에 대한 언급이 없습니다.",
                    suggestion="Scope 3 배출량을 산정했는지, 산정하지 않았다면 그 사유와 향후 계획을 한 문장으로라도 언급해 주세요."
                )
            )

        if not has_base_year:
            issues.append(
                ValidationIssue(
                    code="S2-9",
                    severity="warning",
                    title="기준연도(Base year) 미기재",
                    detail="배출량 또는 감축 목표가 어느 기준연도를 기준으로 하는지 명시되어 있지 않습니다.",
                    suggestion="\"20XX년 배출량을 기준연도(base year)로 설정하였다\"는 식으로 기준연도를 명시해 주세요."
                )
            )

        if not has_target_number:
            issues.append(
                ValidationIssue(
                    code="S2-9",
                    severity="warning",
                    title="정량 목표 수치 부족",
                    detail="\"감축한다\", \"줄인다\"와 같은 표현은 있으나, 몇 % 또는 얼마만큼 줄이는지 정량적 수치가 없습니다.",
                    suggestion="예: \"2030년까지 2019년 대비 Scope 1+2 배출량을 50% 감축\"과 같이 수치를 포함한 목표를 작성해 주세요."
                )
            )

    # overall_status 계산
    has_error = any(i.severity == "error" for i in issues)
    has_warning = any(i.severity == "warning" for i in issues)

    if has_error:
        overall = "fail"
    elif has_warning:
        overall = "partial"
    else:
        overall = "pass"

    return ValidationResult(overall_status=overall, issues=issues)

# =========================
# IFRS S2 필수 요소 정의 & 문단 보완 로직
# =========================

@dataclass
class RequiredElement:
    key: str
    label: str


@dataclass
class IfrsRequirement:
    code: str
    title: str
    summary: str
    elements: List[RequiredElement]


IFRS_REQUIREMENTS: Dict[str, IfrsRequirement] = {}


def _register_requirement(req: IfrsRequirement) -> None:
    IFRS_REQUIREMENTS[req.code] = req


# 14: 전략/전환 계획
_register_requirement(
    IfrsRequirement(
        code="14",
        title="기후 관련 전략 및 전환 계획",
        summary="기후 관련 리스크·기회에 대응하기 위한 전략과 전환 계획, 주요 실행 과제와 정량 정보를 설명해야 합니다.",
        elements=[
            RequiredElement(key="risk_type",          label="리스크/기회 유형"),
            RequiredElement(key="time_horizon",       label="시간대(Time horizon)"),
            RequiredElement(key="financial_impact",   label="재무적 영향"),
            RequiredElement(key="strategic_response", label="대응 전략/전환 계획"),
            RequiredElement(key="quantitative_metrics", label="정량 지표"),
        ],
    )
)

# 22–23,25: 시나리오 분석/기후 탄력성
_register_requirement(
    IfrsRequirement(
        code="22–23,25",
        title="기후 관련 시나리오 분석 및 기후 탄력성",
        summary="사용한 기후 시나리오, 주요 가정, 재무적 영향 및 사업·전략의 기후 탄력성을 설명해야 합니다.",
        elements=[
            RequiredElement(key="scenario_description",  label="시나리오 설명"),
            RequiredElement(key="key_assumptions",       label="주요 가정/전제"),
            RequiredElement(key="resilience_evaluation", label="기후 탄력성 평가"),
            RequiredElement(key="financial_impact",      label="시나리오별 재무적 영향"),
        ],
    )
)

# 29(a)–29(c): 배출 지표
_register_requirement(
    IfrsRequirement(
        code="29(a)–29(c)",
        title="온실가스 배출 지표(Scope 1·2·3)",
        summary="Scope 1·2·3 배출량, 기준연도 및 목표치, 달성 현황 등 핵심 배출 지표를 공시해야 합니다.",
        elements=[
            RequiredElement(key="scope_coverage", label="Scope 1·2·3 범위"),
            RequiredElement(key="base_year",      label="기준연도(Base year)"),
            RequiredElement(key="target_value",   label="정량 목표 수치"),
            RequiredElement(key="progress",       label="목표 달성 현황/추세"),
        ],
    )
)


def _run_required_element_detector(key: str, text: str) -> tuple[bool, str]:
    lower = text.lower()

    if key == "risk_type":
        present = any(
            kw in text
            for kw in [
                "전환 리스크", "물리적 리스크", "기후 리스크",
                "기후 관련 리스크", "기후 관련 위험", "기회", "비즈니스 기회"
            ]
        )
        reason = "기후 관련 리스크/기회 유형이 " + ("언급되어 있습니다." if present else "문단에서 뚜렷이 보이지 않습니다.")
        return present, reason

    if key == "time_horizon":
        year_pattern = r"20\d{2}\s*년"
        present = bool(re.search(year_pattern, text)) or any(
            kw in text for kw in ["단기", "중기", "장기"]
        )
        reason = "시간대(연도 또는 단기/중기/장기)가 " + ("명시되어 있습니다." if present else "명시되어 있지 않습니다.")
        return present, reason

    if key == "financial_impact":
        present = _has_number(text) and any(
            kw in text
            for kw in ["비용", "매출", "손익", "영업이익", "투자", "현금흐름", "손실", "영향"]
        )
        # ✅ S2-9 취지에 맞춰 전략과 재무 영향의 연결고리를 명시하도록 피드백 수정
        reason = "재무적 영향(비용/매출/손익 등 + 숫자)이 " + ("포함되어 있습니다." if present else "충분히 설명되어 있지 않습니다. 이 전략이 기업의 재무 성과(예: 비용 절감, 매출 증대)에 미치는 영향을 명시해 주세요.")
        return present, reason

    if key == "strategic_response":
        present = any(
            kw in text
            for kw in ["전략", "계획", "로드맵", "대응", "완화", "전환", "투자 확대", "재생에너지", "감축 활동"]
        )
        # ✅ S2-9 취지에 맞춰 어떤 리스크에 대한 대응인지 명시하도록 피드백 수정
        reason = "대응 전략/전환 계획이 " + ("서술되어 있습니다." if present else "구체적으로 서술되어 있지 않습니다. 이 전략이 어떤 기후 리스크 또는 기회에 대응하기 위한 것인지 명시해 주세요.")
        return present, reason

    if key == "quantitative_metrics":
        present = _has_number(text) and any(
            kw in text
            for kw in ["비율", "%", "지표", "목표", "감축률"]  # tCO2e와 같은 원시 지표 요구는 제거하고 목표나 비율에 집중
        )
        # ✅ S2-9 취지에 맞춰 전략의 효과를 측정하는 목표치에 집중하도록 피드백 수정
        reason = "전략의 정량적 목표나 지표가 " + ("포함되어 있습니다." if present else "전략의 효과를 측정할 수 있는 정량적 목표(예: 감축 목표 비율, 투자 금액)가 부족합니다.")
        return present, reason

    if key == "scenario_description":
        present = any(
            kw.lower() in lower
            for kw in ["시나리오", "scenario", "1.5", "2℃", "4℃", "nze", "넷제로"]
        )
        reason = "사용한 기후 시나리오가 " + ("언급되어 있습니다." if present else "명시되어 있지 않습니다.")
        return present, reason

    if key == "key_assumptions":
        present = any(
            kw in text
            for kw in ["가정", "전제", "가정 하에", "탄소 가격", "수요", "성장률", "가격"]
        )
        reason = "시나리오에 사용한 주요 가정/전제가 " + ("설명되어 있습니다." if present else "설명되지 않습니다.")
        return present, reason

    if key == "resilience_evaluation":
        present = any(
            kw in text
            for kw in ["탄력성", "resilience", "견조", "유지 가능", "영향을 흡수", "버틸 수"]
        )
        reason = "기후 탄력성(전략이 시나리오를 버틸 수 있는지)에 대한 평가는 " + ("포함되어 있습니다." if present else "거의 포함되어 있지 않습니다.")
        return present, reason

    if key == "scope_coverage":
        present = any(
            kw in lower
            for kw in ["scope 1", "scope1", "scope 2", "scope2", "scope 3", "scope3"]
        ) or any(kw in text for kw in ["스코프1", "스코프2", "스코프3"])
        reason = "Scope 1·2·3 배출 범위가 " + ("언급되어 있습니다." if present else "언급되지 않습니다.")
        return present, reason

    if key == "base_year":
        present = ("기준연도" in text) or ("base year" in lower) or bool(
            re.search(r"20\d{2}\s*년.*기준", text)
        )
        reason = "기준연도(Base year)가 " + ("명시되어 있습니다." if present else "명시되어 있지 않습니다.")
        return present, reason

    if key == "target_value":
        present = _has_number(text) and any(
            kw in text for kw in ["감축", "목표", "줄이", "낮추", "달성"]
        )
        reason = "정량 목표 수치가 " + ("포함되어 있습니다." if present else "구체적인 수치 없이 서술만 있습니다.")
        return present, reason

    if key == "progress":
        present = any(
            kw in text
            for kw in ["달성률", "진행률", "이행 상황", "성과", "추세", "year-on-year", "YoY"]
        )
        reason = "목표 달성 현황/추세가 " + ("설명되어 있습니다." if present else "거의 설명되지 않습니다.")
        return present, reason

    # 기본: 모르면 수동 검토
    return False, "자동으로 판단하기 어려운 요소입니다. 수동 검토가 필요합니다."


def _evaluate_required_elements(paragraph: str, ifrs_code: str) -> tuple[Optional[IfrsRequirement], List[ElementCheckResult]]:
    req = IFRS_REQUIREMENTS.get(ifrs_code)
    if not req:
        return None, []

    results: List[ElementCheckResult] = []
    for element in req.elements:
        present, reason = _run_required_element_detector(element.key, paragraph)
        results.append(
            ElementCheckResult(
                key=element.key,
                label=element.label,
                present=present,
                reason=reason,
            )
        )
    return req, results


def _build_enhance_prompt(paragraph: str, req: IfrsRequirement, elements: List[ElementCheckResult], user_message: Optional[str] = None) -> str:
    missing = [e for e in elements if not e.present]
    if missing:
        missing_lines = "\n".join(
            f"- {e.label}: {e.reason}"
            for e in missing
        )
    else:
        missing_lines = "- (주요 요소 누락 없음)"

    # 사용자가 채팅으로 남긴 추가 요청 블록
    user_block = ""
    if user_message:
        user_block = f"\n[사용자의 추가 요청]\n{user_message}\n"

    prompt = f"""
당신은 IFRS S2 기후 관련 공시를 작성하는 전문 컨설턴트입니다.

아래는 기업 지속가능보고서의 한 문단입니다.

[원문 문단]
{paragraph}

이 문단은 IFRS S2의 다음 요구사항에 대응합니다:
- 제목: {req.title} (IFRS S2 {req.code}에 해당)
- 요약: {req.summary}

현재 문단을 분석한 결과, 다음 IFRS 필수 요소가 부족하거나 불충분합니다:
{missing_lines}
{user_block}
위 요소를 모두 반영하여, 보고서에 바로 사용할 수 있는 완성된 한국어 공시 문단을 한 단락으로 작성해 주세요.

작성 규칙:
1. 원문의 맥락과 내용은 유지하되, 부족한 정보(시간대, 재무 영향, Scope, 목표 수치 등)를 구체적으로 채워 넣습니다.
2. 정량적 데이터가 누락된 부분은 LLM이 임의로 가정하지 말고, 해당 문맥에 맞게 [필수 입력: (누락된 데이터 내용)] 형식으로 명시적인 사용자 입력 요청 문구를 삽입하세요.
   (예: 재무 영향이 누락된 경우 -> [필수 입력: 예상되는 비용 절감액 또는 매출 증대 효과], 목표가 누락된 경우 -> [필수 입력: 2030년 감축 목표 비율])
3. **[절대 금지] 생성된 문단 안에 'IFRS S2'라는 용어나 문단 번호({req.code})를 절대 포함하지 마세요. 사용자가 읽는 보고서 문단에는 이러한 기술적 코드나 규정 이름이 들어가면 안 됩니다.**
4. 결과는 하나의 문단만 출력하고, 불릿 포인트나 추가 설명은 작성하지 마세요.
5. **[필수 제약] 오직 요청된 IFRS S2 코드({req.code})와 관련된 내용만 포함해야 하며, 거버넌스, 전략, 위험 관리, 지표 및 목표 등 다른 핵심 IFRS S2 영역의 내용은 일절 포함하지 마세요.**
"""
    return prompt.strip()


def _enhance_paragraph_internal(paragraph: str, ifrs_code: str, user_message: Optional[str] = None) -> tuple[Optional[IfrsRequirement], List[ElementCheckResult], str]:
    """
    단일 문단 + IFRS 코드 → 필수 요소 평가 → LLM으로 보완 문단 생성
    """
    req, elements = _evaluate_required_elements(paragraph, ifrs_code)

    if req:
        prompt = _build_enhance_prompt(paragraph, req, elements, user_message)
    else:
        # 지원하지 않는 코드인 경우: 일반적인 IFRS S2 스타일 보완 프롬프트
        prompt = (
            "당신은 IFRS S2 기후 관련 공시 전문가입니다.\n"
            "아래 기업 지속가능보고서 문단을 IFRS S2 공시 스타일에 맞게 더 구체적으로 보완해 주세요.\n\n"
            f"[원문 문단]\n{paragraph}\n\n"
            "- 기후 관련 리스크/기회, 전략, 재무적 영향, 정량 지표를 명확히 포함해 주세요.\n"
            "- 실제 숫자는 예시 수준으로 자연스럽게 가정해 사용해도 됩니다.\n"
            "- 결과는 보고서에 바로 붙여 넣을 수 있는 하나의 한국어 문단으로만 작성해 주세요.\n"
            "- **[필수 제약] 오직 이 문단에서 다루는 주제만 다루고, 거버넌스, 전략, 위험 관리, 지표 및 목표 등 다른 핵심 IFRS S2 영역의 내용은 일절 포함하지 마세요.**"
        )
        if user_message:
            prompt += f"\n[사용자의 추가 요청]\n{user_message}\n"

    try:
        response = openai_client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "당신은 IFRS S2 기후 관련 공시를 작성하는 전문 컨설턴트입니다."
                },
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=800,
        )
        completed = (response.choices[0].message.content or "").strip()
        if not completed:
            completed = paragraph
    except Exception as e:
        logger.error(f"LLM paragraph enhance error: {e}")
        completed = paragraph

    return req, elements, completed

@mcp.tool
def validate_disclosure(codes: List[str], draft_text: str, industry: str = "은행") -> ValidationResult:
    """
    작성된 공시 문단이 IFRS S2 요구사항을 어느 정도 충족하는지 간단히 검증합니다.

    - codes: 이 문단이 대응하는 IFRS S2 코드들 (예: ["S2-5"], ["10(b)", "22–23"], ["29–36"])
    - draft_text: 보고서 초안 문단
    - industry: 업종 (향후 업종별 룰 분기를 위해 남겨둠)

    반환 값은 overall_status("pass"/"partial"/"fail")와
    이슈 리스트(ValidationIssue)를 포함하여, 프론트에서
    파란/빨간 AI 코멘트 박스로 바로 사용할 수 있습니다.
    """
    return _validate_disclosure_internal(codes, draft_text, industry)


@mcp.tool
def enhance_paragraph(paragraph: str, ifrs_code: str, industry: str = "IT서비스", user_message: Optional[str] = None) -> EnhanceParagraphResponse:
    """
    단일 문단을 지정된 IFRS S2 코드 기준으로 분석하여
    부족한 요소와 AI가 보완한 최종 문단을 반환합니다.
    """
    req, elements, completed = _enhance_paragraph_internal(paragraph, ifrs_code, user_message)
    title = req.title if req else f"IFRS S2 {ifrs_code}"

    return EnhanceParagraphResponse(
        ifrs_code=ifrs_code,
        ifrs_title=title,
        missing_elements=elements,
        completed_paragraph=completed,
    )



# =========================
# REST API Request 스키마
# =========================

class MapRequest(BaseModel):
    raw_text: str
    industry: str
    jurisdiction: str = "IFRS"
    mode: Literal["fast", "accurate", "auto"] = "auto"  # 하이브리드 모드


class ValidateRequest(BaseModel):
    codes: List[str]
    draft_text: str
    industry: str = "은행"


class TextAnalysisRequest(BaseModel):
    """텍스트 분석 요청 모델"""
    raw_text: str
    industry: str = "IT서비스"
    jurisdiction: str = "대한민국"


# =========================
# REST API 엔드포인트
# =========================

@api.get("/")
def read_root():
    return {
        "message": "IFRS S2 Navigator API - REST Wrapper for MCP Tools",
        "modes": {
            "fast": "룰 기반만 사용 (즉시 응답)",
            "accurate": "룰 기반 힌트 + LLM 최종 결정 (2-3초)",
            "auto": "룰 기반 먼저 → 신뢰도 낮으면 LLM 호출 (기본값)"
        }
    }


@api.get("/health")
def health_check():
    return {
        "status": "healthy",
        "available_tools": ["map_to_ifrs_s2", "validate_disclosure"],
        "llm_model": LLM_MODEL,
    }


@api.post("/api/map", response_model=MappingResult)
def api_map(payload: MapRequest) -> MappingResult:
    """
    TCFD/ESG 텍스트를 IFRS S2 요구사항에 매핑합니다.
    
    - mode: "fast" (룰만), "accurate" (LLM), "auto" (하이브리드, 기본값)
    """
    return _hybrid_mapping(
        payload.raw_text, 
        payload.industry, 
        payload.jurisdiction, 
        payload.mode
    )


@api.post("/api/validate", response_model=ValidationResult)
def api_validate(payload: ValidateRequest) -> ValidationResult:
    """
    작성된 공시 문단이 IFRS S2 요구사항을 충족하는지 검증합니다.
    """
    return _validate_disclosure_internal(payload.codes, payload.draft_text, payload.industry)

@api.post("/api/enhance-paragraph", response_model=EnhanceParagraphResponse)
def api_enhance_paragraph(payload: EnhanceParagraphRequest) -> EnhanceParagraphResponse:
    """
    단일 문단을 지정된 IFRS S2 코드 기준으로 분석하여
    부족한 요소를 보여주고, AI가 보완한 완성 문단을 반환합니다.
    """
    req, elements, completed = _enhance_paragraph_internal(
        payload.paragraph,
        payload.ifrs_code,
        payload.user_message,
    )
    title = req.title if req else f"IFRS S2 {payload.ifrs_code}"

    return EnhanceParagraphResponse(
        ifrs_code=payload.ifrs_code,
        ifrs_title=title,
        missing_elements=elements,
        completed_paragraph=completed,
    )


# =========================
# 데모: 텍스트 입력 + 분석 엔드포인트
# =========================

@api.post("/api/demo/analyze-text", response_model=DemoAnalysisResponse)
async def analyze_text(payload: TextAnalysisRequest):
    """
    텍스트를 받아 IFRS S2 필수 체크리스트를 계산합니다. (PDF 대체 기능)
    """
    input_text = payload.raw_text
    
    if not input_text.strip():
        raise HTTPException(status_code=400, detail="분석할 텍스트를 입력해야 합니다.")
    
    # 4) 체크리스트 계산 (기존 IFRS S2 룰 엔진 재사용)
    checklist = build_checklist_from_text(input_text, industry=payload.industry)
    
    # 5) 문장 단위 분석
    sentence_suggestions = _analyze_pdf_sentences(
        input_text,
        industry=payload.industry,
        jurisdiction=payload.jurisdiction,
    )
    
    # 6) 응답
    return DemoAnalysisResponse(
        pdf_text=input_text,
        pdf_meta={
            "filename": "User Input Text",  # 파일명 대신 사용자 입력 텍스트임을 명시
            "page_index": 0,
        },
        checklist=checklist,
        sentence_suggestions=sentence_suggestions,
    )


# =========================
# 데모: PDF 문장 단위 분석 헬퍼
# =========================

def _paragraph_code_to_group_code(paragraph_code: str) -> Optional[str]:
    """
    룰/매핑 결과에서 나오는 IFRS S2 단락 코드(예: "5–7", "22–23,25", "29(a)–29(c)")
    를 S2 그룹 코드(예: "S2-5", "S2-15", "S2-9")로 변환합니다.
    """
    if not paragraph_code:
        return None

    normalized = paragraph_code.replace(" ", "")
    # 거버넌스: 5–7
    if "5–7" in normalized or "5-7" in normalized:
        return "S2-5"
    # 시나리오 분석: 22–23, 25
    if "22–23" in normalized or "22-23" in normalized or "25" in normalized:
        return "S2-15"
    # 지표/배출: 29(a)–29(c), 33–36 등
    if "29(a)" in normalized or "29(a)–29(c)" in normalized or "29(a)-29(c)" in normalized:
        return "S2-9"
    if "33" in normalized or "34" in normalized or "35" in normalized or "36" in normalized:
        return "S2-9"

    return None


def _split_into_sentences(text: str) -> List[str]:
    """
    매우 단순한 문장 분리:
    - 줄바꿈(\n) 단위로 먼저 나누고
    - 마침표/물음표/느낌표/일본어·중국어 마침표(。) 기준으로 다시 분리
    """
    sentence_end = re.compile(r'(?<=[\.!?。])\s+')
    sentences: List[str] = []

    for block in text.splitlines():
        block = block.strip()
        if not block:
            continue
        parts = sentence_end.split(block)
        for p in parts:
            p = p.strip()
            if p:
                sentences.append(p)

    return sentences


def _analyze_pdf_sentences(
    text: str,
    industry: str = "IT서비스",
    jurisdiction: str = "대한민국",
) -> List[SentenceSuggestion]:
    """
    PDF 1페이지 텍스트를 문장 단위로 쪼개서:
    1) 각 문장이 어떤 IFRS S2 단락과 관련 있는지 RULES/매핑으로 판단
    2) 관련된 S2 그룹 코드(S2-5/S2-15/S2-9)에 대해 _validate_disclosure_internal 실행
    3) 부족한 정보(ValidationIssue.suggestion)를 SentenceSuggestion으로 묶어서 반환
    """
    sentences = _split_into_sentences(text)
    suggestions: List[SentenceSuggestion] = []

    for idx, sent in enumerate(sentences):
        # 너무 짧은 문장은 제외 (예: 캡션, 제목 등)
        if len(sent) < 10:
            continue

        # 1) 룰 기반 매핑 (빠르게)
        mapping = _hybrid_mapping(
            raw_text=sent,
            industry=industry,
            jurisdiction=jurisdiction,
            mode="fast",   # 여기서는 LLM까지 안 쓰고 RULES만 사용
        )

        # 2) 매핑 결과의 코드(예: "5–7")를 S2 그룹 코드("S2-5")로 변환
        group_codes: set[str] = set()
        for cand in mapping.candidates:
            if cand.code == "(검토 필요)":
                continue
            group_code = _paragraph_code_to_group_code(cand.code)
            if group_code:
                group_codes.add(group_code)

        # 어떤 S2 그룹과도 연관이 없으면 이 문장은 스킵
        if not group_codes:
            continue

        # 3) 각 그룹 코드별로 검증 실행
        all_issues: List[ValidationIssue] = []
        status_list: List[str] = []
        for gc in sorted(group_codes):
            vr = _validate_disclosure_internal([gc], sent, industry)
            all_issues.extend(vr.issues)
            status_list.append(vr.overall_status)

        # 이 문장에 대해 실제로 문제가 없으면 굳이 노출하지 않음
        if not all_issues:
            continue

        # 4) 전체 문장 상태: fail > partial > pass
        if "fail" in status_list:
            overall = "fail"
        elif "partial" in status_list:
            overall = "partial"
        else:
            overall = "pass"

        # 그룹 코드를 한글 제목으로 변환
        ifrs_titles = [display_group_name(gc) for gc in sorted(group_codes)]
        
        suggestions.append(
            SentenceSuggestion(
                sentence_index=idx,
                sentence_text=sent,
                ifrs_codes=sorted(group_codes),
                ifrs_titles=ifrs_titles,
                overall_status=overall,
                issues=all_issues,
            )
        )

    return suggestions



def build_checklist_from_text(draft_text: str, industry: str = "IT서비스") -> List[ChecklistItem]:
    """
    텍스트로부터 IFRS S2 필수 체크리스트를 생성합니다. 필수 요소별로 검증합니다.
    
    주의: ChecklistItem의 code 필드는 내부 로직용(예: "14", "22–23,25")이며,
    프론트엔드에서는 title 필드를 사용하여 사용자에게 표시해야 합니다.
    title 필드에는 한글 제목(예: "기후 관련 전략 및 전환 계획")이 들어있습니다.
    """
    items: List[ChecklistItem] = []
    
    # IFRS_REQUIREMENTS에 정의된 각 필수 요소별로 검증
    for code, req in IFRS_REQUIREMENTS.items():
        # 필수 요소 평가
        requirement, element_results = _evaluate_required_elements(draft_text, code)
        
        if not requirement:
            continue
        
        # 누락된 요소 확인
        missing_elements = [e for e in element_results if not e.present]
        present_elements = [e for e in element_results if e.present]
        
        # ValidationIssue 생성
        issues: List[ValidationIssue] = []
        for missing in missing_elements:
            # suggestion 메시지 생성
            suggestion = f"{missing.label}에 대한 정보를 추가해 주세요. {missing.reason}"
            
            issues.append(
                ValidationIssue(
                    code=code,
                    severity="error" if len(missing_elements) == len(element_results) else "warning",
                    title=f"{missing.label} 누락",
                    detail=missing.reason,
                    suggestion=suggestion,
                )
            )
        
        # overall_status 계산
        if len(missing_elements) == 0:
            overall_status = "pass"
        elif len(present_elements) == 0:
            overall_status = "fail"
        else:
            overall_status = "partial"
        
        # code 필드는 내부 로직용, title 필드는 UI 표시용
        items.append(
            ChecklistItem(
                code=code,        # 내부 로직용 코드 (예: "14", "22–23,25")
                title=req.title,  # UI 표시용 한글 제목 (예: "기후 관련 전략 및 전환 계획")
                status=overall_status,
                issues=issues,
            )
        )
    
    return items

# =========================
# 서버 실행
# =========================

if __name__ == "__main__":
    import uvicorn
    # FastAPI REST API 서버 실행 (포트 8000)
    # MCP SSE 모드 대신 REST API 사용
    uvicorn.run(api, host="0.0.0.0", port=8000)
