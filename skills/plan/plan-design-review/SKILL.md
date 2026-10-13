---
name: plan-design-review
description: "Review a proposed user experience before implementation for coherent journeys, interaction states, accessibility and alignment with the existing design system."
---

# UX·디자인 검토

Plan의 사용자 경험 검토. 구현 전 계획의 사용자 여정·화면·상호작용 누락을 찾는다. 구현된 화면의 결함 검토는 [review](../../github/review/SKILL.md), 상세 설계 작성은 [design](../../design/SKILL.md)을 사용한다.

[공통 원칙](../../zzzystack/references/core.md)과 [UX·UI](../../design/references/ux-ui.md)를 읽는다. 입력은 사용자·핵심 과업, 기획안, 기존 디자인 기준과 제약이다. UI가 없는 계획에는 화면 검토를 억지로 적용하지 않고 해당 없음과 이유를 기록한다.

1. 핵심 과업의 진입부터 완료·실패 후 복구까지 흐름을 따라간다. 화면이 많거나 분기가 있으면 흐름도나 상태 표로 누락을 드러낸다.
2. 정보 우선순위, 탐색 구조, 용어·버튼 문구, 입력 부담과 피드백을 확인한다. 기존 디자인 시스템과 제품의 실제 사용 맥락을 기준으로 판단한다.
3. 필요한 로딩·빈 상태·오류·성공·부분 완료·권한 부족 상태를 확인한다. 되돌리기, 재시도, 중복 제출과 데이터 보존 정책이 사용자 흐름과 맞는지 살핀다.
4. 화면 크기 변화, 키보드 이동·포커스, 보조기술용 이름, 색상에만 의존하는 안내 등 접근성 요구를 계획에 연결한다. 아직 측정할 수 없는 사항은 구현 후 확인 대상으로 남긴다.
5. 사용을 막는 문제와 취향상 개선을 구분한다. 각 문제에 사용자 영향, 근거, 수정안과 수용 기준을 적는다. 평가를 점수로 표현한다면 근거를 붙이고 측정값처럼 표현하지 않는다.

산출물: 여정·상태별 누락, 우선순위가 있는 수정 제안, 수용 기준과 구현 후 확인 항목. 요청이 검토만이면 원본 수정 없이 보고한다. 수정이 포함되면 기존 승인 범위 내 계획을 갱신하고 주요 흐름 변경은 미정 결정으로 제시한다.

완료: UX 쟁점과 확인 방법이 계획에 연결되어 있다. 계획 검토를 실제 화면 테스트나 접근성 인증으로 표시하지 않는다. [Plan](../SKILL.md)으로 결과를 돌려준다.

gstack의 [plan-design-review](https://github.com/garrytan/gstack/tree/main/plan-design-review) 역할 구분을 참고해 zzzystack용으로 작성한 절차다.
