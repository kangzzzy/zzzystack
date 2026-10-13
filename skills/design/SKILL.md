---
name: design
description: "Design interfaces and implementation structure against agreed product and design requirements."
---

# 설계

산출물은 [디자인·설계 서식](assets/design.md) 또는 프로젝트의 기존 원본에 기록한다.

시스템 구조에는 [웹 아키텍처](references/web-architect.md), 화면·흐름에는 [UX·UI](references/ux-ui.md), 데이터 설계에는 [DB](../build/references/database.md)를 필요한 경우 읽는다.

[공통 원칙](../zzzystack/references/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../zzzystack/references/delegation-execution.md)을 적용한다.

입력: 확정 기획·Feature Map·디자인 방향·제약.

1. 이미 정한 방향과 실제 환경을 확인한다.
2. 중요한 쟁점에 대안·비용·운영 부담·추천 이유를 제시한다.
3. 분야별 담당자가 상세 설계를 맡고 해당 분야 아키텍트가 책임·인터페이스를 조율한다.
4. 요구사항을 설계 요소·검증 방법에 연결한다. 첫 출시를 위해 불필요한 구조를 추가하지 않는다.
5. [독립 검토](../github/review/SKILL.md) 후 범위 내 오류를 수정하고 결정 이유를 남긴다.

작은 변경은 기존 설계 적용 가능성 확인으로 축소한다. 기획·디자인 방향·핵심 구조를 바꾸면 사용자에게 확인한다.

산출물: 디자인/설계 기준, 인터페이스, 결정 근거, 검증 계획. 완료: 주요 이견이 해결되고 구현자가 필요한 기준에 접근할 수 있다.
