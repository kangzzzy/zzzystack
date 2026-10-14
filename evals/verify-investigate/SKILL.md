---
name: verify-investigate
description: "Investigate a symptom or technical question with evidence and bounded experiments."
---

# 조사·문제 해결

문제 영역의 전문 기준이 필요하면 해당 작업 스킬의 references에서 필요한 문서만 읽는다. 서비스 장애는 [서비스 운영](../verify-release/references/service-operations.md)을 참고한다.

[공통 원칙](../../shared/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../../shared/delegation-execution.md)을 적용한다.

1. 질문·증상·기대 결과·조사 범위를 확인한다.
2. 기존 결정·관련 자료·로그를 수집하고 재현 가능성을 확인한다.
3. 사실과 가설을 나누고 가설별 관찰·실험을 정한다.
4. 조사 한도 안에서 원인과 영향 범위를 좁힌다. 실패한 시도도 기록한다.
5. 근거·불확실성·해결 대안을 제시한다.

원인 미확인은 그대로 표시한다. 조사 요청만으로 기능·구조를 변경하지 않는다. 수정까지 승인된 작업이면 [구현](../verify-implementation/SKILL.md), 주요 설계 변경이면 [설계](../verify-design/SKILL.md)로 연결한다.

완료: 질문에 근거로 답했거나, 현재 한계와 다음 판단에 필요한 증거가 명확하다.
