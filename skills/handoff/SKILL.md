---
name: handoff
description: "Save or restore work context when pausing, resuming or switching coding tools."
---

# 중단·재개·인수인계

[공통 원칙](../zzzystack/references/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../zzzystack/references/delegation-execution.md)을 적용한다.

[인수인계 기록](assets/handoff.md)에 다음을 남긴다.

- 목표·완료 조건, 현재 작업 ID·프로젝트·브랜치/산출물 위치
- 확정된 결정의 링크, 실제 변경 상태와 진행·완료·보류 구분
- 검증 근거와 미검증, 실패한 시도·누적 재시도·사용량
- 승인 범위·대기 질문·다음 행동

재개 시 기록과 실제 파일·Git·외부 작업 상태를 대조한다. 불일치는 조사한 뒤 해결하며 완료된 외부 행동을 맹목적으로 재실행하지 않는다. 중단 당시 실행 중이던 작업은 결과를 확인하기 전 실패나 성공으로 단정하지 않는다.

도구 전환도 이 절차를 사용한다. 사용량 부족에 따른 전환은 해당 작업에 유효한 승인을 확인한다. 승인 대기·한도 초과는 재시작해도 유지한다.

완료: 다음 실행자가 추측 없이 이어갈 수 있다. Automations는 재개 시점만 관리하며 이 절차와 동일한 승인 경계를 따른다.
