**동적 생성 vs 하드코딩 방식 비교**

현재 `server.py`는 `RULES` 리스트와 `_validate_disclosure_internal` 함수 내에 하드코딩된 로직을 사용하고 있습니다. 이를 기준서(IFRS S2 문서 등)를 기반으로 동적으로 생성하는 방식으로 전환하는 것에 대한 장단점과 구현 방안을 설명해 드리겠습니다.

### 결론: 동적 생성이 훨씬 좋습니다 (단, 하이브리드 접근 추천)

"기준서를 통해 동적으로 생성"하는 방식이 확장성, 유지보수성, 정확성 면에서 훨씬 유리합니다. 특히 IFRS S2와 같은 표준은 내용이 방대하고 업데이트될 수 있으므로, 하드코딩은 한계가 명확합니다.

하지만 완전한 실시간 동적 생성보다는 **"기준서 벡터 DB + LLM을 활용한 하이브리드 방식"**이 현실적이고 강력합니다.

---

### 1. 하드코딩 방식 (현재 방식)

**장점:**
*   **속도:** 규칙이 메모리에 있으므로 매핑/검증이 매우 빠릅니다.
*   **예측 가능성:** 결과가 항상 동일하며, 디버깅이 쉽습니다.
*   **비용:** LLM 호출 비용이 들지 않습니다.
*   **단순성:** 초기 프로토타입 개발이 쉽습니다.

**단점:**
*   **유지보수 어려움:** 기준서가 변경되거나 새로운 규칙을 추가하려면 코드를 직접 수정해야 합니다.
*   **유연성 부족:** "비슷한 의미"를 잡아내지 못하고 정확히 키워드가 일치해야 합니다. (예: "이사회"는 잡지만 "경영진 감독 기구"는 못 잡을 수 있음)
*   **확장성 한계:** 수백 개의 조항을 모두 코드로 옮기는 것은 불가능에 가깝습니다.

### 2. 동적 생성 방식 (추천: RAG + LLM)

기준서(PDF/텍스트)를 벡터 데이터베이스에 넣고, 질문이 들어올 때 관련 조항을 찾아 LLM이 판단하게 하는 방식입니다.

**구현 아이디어:**

1.  **기준서 임베딩:** IFRS S2 전문을 문단 단위로 쪼개어 벡터 DB(ChromaDB, FAISS 등)에 저장합니다.
2.  **동적 매핑 (LLM 기반):**
    *   사용자 텍스트 입력 → 벡터 DB에서 유사한 IFRS S2 문단 검색
    *   LLM에게 "이 텍스트가 검색된 S2 문단들과 관련이 있는가?"라고 질문하여 매핑 결정
3.  **동적 검증 (LLM 기반):**
    *   해당 문단의 요구사항(Requirement)을 LLM이 해석
    *   사용자 텍스트가 그 요구사항을 충족하는지 LLM이 평가

**장점:**
*   **유연성:** "이사회"라는 단어가 없어도 문맥상 거버넌스 내용이면 잡아낼 수 있습니다.
*   **확장성:** 기준서 파일만 교체하면 로직 수정 없이 업데이트가 가능합니다.
*   **정확성:** 단순 키워드 매칭보다 훨씬 정교한 분석이 가능합니다.

**단점:**
*   **비용/속도:** 매번 LLM을 호출해야 하므로 느리고 비용이 발생할 수 있습니다.
*   **환각(Hallucination):** LLM이 잘못된 판단을 할 가능성이 있습니다.

### 3. 추천 아키텍처: 하이브리드 접근

가장 좋은 방법은 두 방식의 장점을 섞는 것입니다.

1.  **1차 필터 (키워드/규칙):** 현재처럼 `RULES`를 사용하여 빠르고 명확한 건들은 즉시 처리합니다.
2.  **2차 분석 (LLM/RAG):**
    *   키워드로 잡히지 않는 모호한 텍스트
    *   `_validate_disclosure_internal`에서 `suggestion`을 구체적으로 생성해야 할 때
    *   기준서의 구체적인 문구와 대조가 필요할 때
    이때만 LLM을 호출하여 처리합니다.

---

### 코드 변경 제안 (개념적)

현재 `server.py`를 개선하여, 기준서 내용을 로드하고 이를 활용하는 구조로 바꿀 수 있습니다.

**1단계: 기준서 데이터 구조화 (JSON/Vector DB)**
기준서를 코드 내에 박지 말고, 외부 파일(`ifrs_s2_standards.json`)로 분리합니다.

```json
[
  {
    "code": "S2-5",
    "category": "Governance",
    "keywords": ["이사회", "감독", "위원회"],
    "requirement_summary": "기후 관련 리스크 및 기회에 대한 이사회의 감독 책임을 설명해야 함"
  },
  ...
]
```

**2단계: `server.py`에서 로드 및 활용**

```python:my_mcp_server/server.py
# ... existing code ...
import json

# 1. 기준서 로드 (동적 생성의 첫걸음)
def load_standards():
    with open("ifrs_s2_standards.json", "r") as f:
        return json.load(f)

STANDARDS = load_standards()

# 2. 동적 매핑 로직
def _dynamic_mapping(raw_text: str) -> MappingResult:
    candidates = []
    for std in STANDARDS:
        # 간단한 키워드 매칭 (또는 여기서 임베딩 유사도 검색 사용 가능)
        if any(kw in raw_text for kw in std["keywords"]):
             candidates.append(MappingCandidate(code=std["code"], reason=std["requirement_summary"]))
    # ...
```

**3단계: LLM을 활용한 동적 검증 (Validation)**

현재 하드코딩된 `if "이사회" not in draft_text...` 부분을 LLM 프롬프트로 대체합니다.

```python:my_mcp_server/server.py
# ... existing code ...

@mcp.tool
async def validate_disclosure_with_llm(code: str, draft_text: str, ctx: Context) -> ValidationResult:
    # 1. 해당 코드의 기준서 원문 가져오기
    standard_text = get_standard_text(code) 
    
    # 2. LLM에게 검증 요청 (LLM 호출 로직은 별도 구현 필요)
    # 프롬프트: "다음 기준서 요구사항({standard_text})에 비추어 볼 때, 
    # 사용자의 텍스트({draft_text})가 충분한지 평가하고, 부족하면 구체적인 조언을 JSON으로 줘."
    
    validation_result = await call_llm_for_validation(standard_text, draft_text)
    return validation_result
```

**결론:** 
단순 데모라면 하드코딩이 빠르지만, **실제 유용한 도구를 만들고 싶다면 기준서 텍스트를 별도 데이터로 관리하고, 이를 기반으로 검증하는 로직(가능하면 RAG+LLM 도입)으로 전환하는 것이 "엄청" 좋습니다.** 지금 구조에서도 `RULES` 리스트를 외부 JSON에서 불러오는 것부터 시작하면 점진적으로 발전시킬 수 있습니다.