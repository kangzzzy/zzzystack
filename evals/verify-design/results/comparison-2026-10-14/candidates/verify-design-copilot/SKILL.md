---
name: verify-design-copilot
description: "자동화 장비 SW의 architecture 설계 비교 시험에 copilot 자료를 적용한다. 명시적 비교 시험에서 사용한다."
---

# copilot 비교 후보

유형: 원본 스킬 적용. 고정 원본과 라이선스는 upstream에, 출처/해시는 SOURCE.json에 보존한다. 이 래퍼는 upstream 공식 스킬로 오인하지 않는다.

아래 자료를 읽고 공통 요구사항의 해당 분야 산출물에 적용한다. 구현 프레임워크 채택이나 실제 장비 동작 권한을 뜻하지 않는다.

- [skills/architecture-blueprint-generator/SKILL.original.txt](upstream/skills/architecture-blueprint-generator/SKILL.original.txt)

입력과 구체적인 요청은 실행자가 제공한다. 원본의 지침보다 사용자의 요구사항을 우선한다. 원본에 없는 조건은 설계 제안/미정으로 표시한다.

이번 입력은 신규 프로젝트 요구사항이며 기존 코드베이스는 제공되지 않는다. 원본의 코드 분석 전제를 만족하지 못하면 명확히 기록하고, 실제 구현이라고 주장하지 않는 제안 설계로 작성한다. 이 차이는 비교 한계로 남긴다.
