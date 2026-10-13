---
name: build
description: "Implement an agreed change, verify it and obtain independent review."
---

# 구현

테스트 우선 개발을 요청했거나 프로젝트 규칙에 정해져 있으면 [TDD](../github/tdd/SKILL.md)를 적용한다. 이슈→PR→병합까지 요청한 경우 전체 진행은 [ship](../github/ship/SKILL.md)을 따른다.

작업 기준·검증·상태를 [작업 서식](assets/task.md) 또는 프로젝트의 기존 작업 원본에 기록한다.

작업 범위에 맞는 [프런트엔드](references/frontend.md), [백엔드·API](references/backend.md), [DB](references/database.md) 지침만 읽는다. 역할별 책임·입력·산출물·경계를 구현에 적용한다.

[공통 원칙](../zzzystack/references/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../zzzystack/references/delegation-execution.md)을 적용한다.

입력: 범위·완료 조건, 관련 기능 ID·기획·설계, 작업 식별자.

1. 실제 상태·선행 작업·기존 변경을 확인하고 수행 계획을 정리한다.
2. 합의한 범위에서 결과물을 작성한다. 개발, 문서, CAD 등 해당 분야 역할과 도구를 선택한다.
3. 작성자가 테스트·실행·렌더링 등 산출물에 맞는 자체 검증을 한다.
4. [독립 검토](../github/review/SKILL.md)를 요청하고 범위 내 결함을 수정·재검증한다.
5. 영향받는 기준·문서와 기능별 상태를 갱신하고 변경 내용·검증 근거·남은 제한을 보고한다.

판단 충돌·주요 변경·한도 도달 시 해당 작업을 보류한다. 재시도 횟수를 초기화해서 한도를 피하지 않는다.

완료: 수용 기준과 독립 검토를 통과하고 관련 기록이 일치한다. 배포·실물 반영은 [별도 절차](../github/release/SKILL.md)다. GitHub Issues 사용 여부와 순차/병렬 정책은 프로젝트 설정을 따른다.
