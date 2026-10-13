---
name: plan
description: "Coordinate problem discovery, product scope, UX and engineering plan reviews to define a product's first release and acceptance criteria."
---

# Plan · 기획 및 설계

## 목적별 스킬

필요한 스킬만 선택한다. 아래 순서는 일반적인 흐름이며 네 단계를 매번 모두 실행하지 않는다. 기존 계획과 결정이 충분하면 해당 검토부터 시작한다. 각 스킬은 직접 호출할 수도 있다.

| 목적 | 스킬 | 결과 |
|---|---|---|
| 문제 정의 | [office-hours](office-hours/SKILL.md) | 사용자 문제·근거·접근안·검증 계획 |
| 제품 방향·범위 검토 | [plan-ceo-review](plan-ceo-review/SKILL.md) | 제품 가치·출시 범위·우선순위 판단 |
| UX·디자인 검토 | [plan-design-review](plan-design-review/SKILL.md) | 사용자 여정·상태·UX 수용 기준 |
| 기술 설계 검토 | [plan-eng-review](plan-eng-review/SKILL.md) | 구조·위험·구현 및 검증 계획 |

여기서 Plan은 작업 단계이며 PO·PM 직무를 뜻하지 않는다. 네 스킬의 결과는 기존 제품 기준·Feature Map·설계·결정 원본에 연결하고, 서로 다른 문서에 상충하는 확정안을 만들지 않는다. 검토 스킬에서 돌아오면 요청한 나머지 단계만 진행하며 같은 검토를 반복 호출하지 않는다.

## 기획 절차

제품 기준을 기록할 때 [프로젝트](../zzzystack/assets/project.md), [Feature Map](../zzzystack/assets/feature-map.md), [결정](../zzzystack/assets/decisions.md) 서식 중 필요한 것을 사용한다.

웹 서비스 기획에는 [웹 기획](references/web-planner.md)을 적용한다. UX 쟁점은 [UX·UI](../design/references/ux-ui.md), 기술 제약은 [아키텍처](../design/references/web-architect.md)를 필요한 경우 읽는다.

[공통 원칙](../zzzystack/references/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../zzzystack/references/delegation-execution.md)을 적용한다.

입력: 사용자 요청, 기존 목표·결정·제약. 신규 프로젝트는 분야별 기획자와 필요한 역할을 함께 확정한다.

1. 사용자·문제·사용 상황·목표·제약을 짧게 질문하며 구체화한다.
2. 관련 역할과 초안 단계에 협의한다. 웹 기획자와 로봇 기획자를 범용 역할로 대체하지 않는다.
3. 다른 접근안과 추천 근거를 제시하고 선택을 기록한다.
4. 첫 출시 범위·제외 범위, Feature Map, 디자인 방향, 완료 조건을 정리한다.
5. 확정 직전에 관련 역할과 재검토한다. 그 사이에는 쟁점에 필요한 역할만 호출한다.
6. 미정·충돌·가정과 의존성을 보여주고 사용자의 명시적 기획 확정을 받는다.

산출물: 제품 기준, 기능 ID, 디자인 방향, 수용 기준, 결정·보류 목록. 완료: 첫 출시 기획의 승인 근거가 있다. 추측으로 승인을 채우지 않는다.

이후 [설계](../design/SKILL.md)로 연결한다. 등록·개발 자동 시작은 프로젝트 정책에 명시된 경우만 적용한다.
