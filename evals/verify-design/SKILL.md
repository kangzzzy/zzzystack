---
name: verify-design
description: "Design interfaces and implementation structure against agreed product and design requirements."
---

# 설계

산출물은 [디자인·설계 서식](assets/design.md) 또는 프로젝트의 기존 원본에 기록한다.

소프트웨어 설계는 다음 산출물을 작성한다. 기존 원본이 있으면 갱신하며 양식만 복사한 상태를 완료로 표시하지 않는다.

- [시스템 설계서](assets/system-design.docx): 범위·구성도·구성요소 책임·인터페이스·처리 흐름·품질 요구·설계 결정·요구사항 대응.
- [데이터베이스 설계서](assets/database-design.xlsx): DB 개요·ERD·테이블·컬럼·키·관계·인덱스·보존 정책. DB가 없으면 생략하고 시스템 설계서에 해당 없음을 기록한다.
- [UI 화면 설계서](assets/ui-screen-design.docx): 화면 목록·흐름·요소별 동작·상태·수용 기준. 화면 시안·프로토타입은 Figma에서 작업한다. 화면 ID를 Figma 프레임 이름과 맞추고 Word에 프레임 링크·기준 버전/날짜·화면 이미지를 넣는다. 시각 기준은 Figma, 동작·업무 규칙은 Word를 원본으로 관리한다. Figma에 접근할 수 없으면 연결 필요 상태를 표시한다. UI가 없는 소프트웨어는 설계서에 해당 없음과 사유를 기록한다.

시스템 구조에는 [웹 아키텍처](references/web-architect.md), 화면·흐름에는 [UX·UI](references/ux-ui.md), 데이터 설계에는 [DB](../verify-implementation/references/database.md)를 필요한 경우 읽는다.

[공통 원칙](../../shared/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../../shared/delegation-execution.md)을 적용한다.

입력: 확정 기획·Feature Map·디자인 방향·제약과 [요구사항 정의서](../../skills/requirements/SKILL.md). 요구 ID를 설계 요소와 검증 방법에 연결한다.

1. 이미 정한 방향과 실제 환경을 확인한다.
2. 중요한 쟁점에 대안·비용·운영 부담·추천 이유를 제시한다.
3. 분야별 담당자가 상세 설계를 맡고 해당 분야 아키텍트가 책임·인터페이스를 조율한다.
4. 요구사항을 설계 요소·검증 방법에 연결한다. 첫 출시를 위해 불필요한 구조를 추가하지 않는다.
5. [독립 검토](../verify-review/SKILL.md) 후 범위 내 오류를 수정하고 결정 이유를 남긴다.

작은 변경은 기존 설계 적용 가능성 확인으로 축소한다. 기획·디자인 방향·핵심 구조를 바꾸면 사용자에게 확인한다.

산출물: 디자인/설계 기준, 인터페이스, 결정 근거, 검증 계획. 완료: 주요 이견이 해결되고 구현자가 필요한 기준에 접근할 수 있다.

소프트웨어는 필요한 설계서가 작성되어 요구사항·인터페이스·오류 처리·호환성·데이터 변경과 복구 제약이 추적 가능해야 한다. 다음은 [구현](../verify-implementation/SKILL.md)이다.
