---
name: zzzystack
description: "Coordinate planning, design, implementation, review and project learning using task skills and relevant specialist guidance."
---

# 진입점

1. 사용자의 실제 요청, 프로젝트 루트, 기존 지침과 `.zzzystack/` 또는 사용자가 지정한 기록 위치를 확인한다. harness 개발 요청과 harness를 사용하는 제품 작업을 구분한다.
2. [공통 원칙](references/core.md)과 필요한 프로젝트 기록만 읽는다. 모든 전문 지침과 스킬을 한꺼번에 로드하지 않는다.
3. 아래 표로 절차를 고른다. 직접 호출은 요청 범위를 우선한다. 단순 질문에 전체 제품 프로세스를 강요하지 않는다.
4. [역할 목록](references/roles.md)에서 필요한 전문 지침만 제안·선정하고 [위임 방식](references/delegation-execution.md)에 따라 현재 세션에 적용하거나 별도 작업자에게 전달한다. 프로젝트에서 이미 확정한 배정은 재사용한다.
5. 입력·산출물·완료 조건·승인 경계를 확인하고 실행한다. 적합한 절차가 없으면 최소 수행안을 제안한다.

| 요청 | 절차 |
|---|---|
| 아이디어, 사용자, 출시 범위, 기능 정의 | [기획](../plan/SKILL.md) |
| 구체적인 사용자 문제 탐색, 아이디어의 가정 확인 | [Plan · 문제 정의](../plan/office-hours/SKILL.md) |
| 제품 가치, 방향, 출시 범위 확대·유지·축소 검토 | [Plan · 제품 방향·범위 검토](../plan/plan-ceo-review/SKILL.md) |
| 구현 전 사용자 여정·화면 상태·접근성 계획 검토 | [Plan · UX·디자인 검토](../plan/plan-design-review/SKILL.md) |
| 구현 전 구조·데이터 흐름·실패 대응·테스트 계획 검토 | [Plan · 기술 설계 검토](../plan/plan-eng-review/SKILL.md) |
| 기술 구조, 디자인, 인터페이스, 설계 대안 | [설계](../design/SKILL.md) |
| 합의된 결과물 작성·변경 | [구현](../build/SKILL.md) |
| 이슈 등록, 로컬 개발부터 PR·병합·출시까지 또는 해당 단계 진행 | [개발·출시 루틴](../github/ship/SKILL.md) |
| 테스트 우선 구현, TDD로 버그 수정 | [TDD](../github/tdd/SKILL.md) |
| 개인 프로젝트 README의 완료 체크리스트·타임라인 갱신 | [진행 기록](../github/progress/SKILL.md) |
| 결과물의 결함·기준 충족 확인 | [독립 검토](../github/review/SKILL.md) |
| 코드·분야 입문, 프로젝트 초기 셋업, 구조·규칙 학습, 학습 기록 갱신 | [온보딩·학습](../onboard/SKILL.md) |
| 배포, 전달, 실물 적용 | [반영](../github/release/SKILL.md) |
| 원인, 오류, 성능, 동작 설명 | [조사](../investigate/SKILL.md) |
| 중단, 재개, 도구 전환 | [인수인계](../handoff/SKILL.md) |
| ADHD 친화적 설명, 집중하기 쉬운 한국어 응답 | [응답 스타일](../i-have-adhd/SKILL.md); 필요한 작업 절차와 함께 적용 |

## 신규 프로젝트

[설정 안내](references/configuration.md)에 따라 예시 설정과 실제 정책·실행 상태를 구분한다. [설정 예시](assets/project.example.json)는 새 프로젝트 초기화에만 사용한다.

프로젝트별 역할·기획·정책을 사용자가 확정하게 한다. 기록 틀은 [프로젝트](assets/project.md), [Feature Map](assets/feature-map.md), [디자인](../design/assets/design.md), [결정](assets/decisions.md), [작업](../build/assets/task.md)을 사용한다. CLI `init`은 틀만 만들며 승인·GitHub 이슈 생성·개발 시작이 아니다.

## 다음 단계

별도 작업자에게 전달할 때는 [위임 패킷](assets/delegation.md), 상태를 보고할 때는 [보고 서식](assets/report.md)을 필요에 따라 사용한다. 서식은 결과물의 틀이며 그 자체가 실행 지시나 승인이 아니다.

기획 확정 후 이슈 생성·자동 시작은 프로젝트 설정과 기존 사용자 승인을 따른다. 개발 관리가 GitHub이면 [GitHub 연결](references/github.md)을 읽는다. 외부 도구 미연결이면 연결됐다고 가정하지 않는다. 검토 통과는 배포 승인이 아니다.

스킬 선택만으로 자동화·외부 행동·병렬 실행을 활성화하지 않는다. 독립 검토와 분리 가능한 작업에만 호스트가 허용하는 별도 실행을 사용한다.
