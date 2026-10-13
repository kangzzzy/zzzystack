---
name: release
description: "Prepare and apply a reviewed release or deliverable under project approval policy."
---

# 배포·전달·적용

환경·배포·롤백에는 [배포](references/deployment.md), 출시 후 상태·장애·복구에는 [서비스 운영](references/service-operations.md)을 적용한다. 운영 요청은 요청받은 점검·복구 범위만 수행하며 새 배포를 전제하지 않는다.

[공통 원칙](../../zzzystack/references/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../../zzzystack/references/delegation-execution.md)을 적용한다.

1. 대상 버전의 검토·완료 조건·미검증 항목을 확인한다.
2. 적용 대상·변경·영향과 복구/롤백 방법을 준비한다.
3. 프로젝트의 중요도별 승인 정책과 실제 권한을 확인한다. 불명확하면 자동 반영하지 않는다.
4. 직접 승인 대상은 검토 가능한 결과·근거·복구 방법을 먼저 준비한 후 승인받는다.
5. 적용 후 정상 동작·접근·실제 버전을 확인한다. 실패하면 사전 승인한 복구 범위 안에서 대응한다.
6. Feature Map의 출시 상태와 실제 반영 근거를 갱신한다.

실제 로봇·설비 작동과 장치 펌웨어 반영은 별도 장비 승인 조건이 필요하다. 시뮬레이션 성공은 실물 승인이나 안전 인증이 아니다. 외부 메시지·문서 전달도 수신 대상과 전송 권한이 있어야 한다.

완료: 실제 적용 확인 또는 실패·복구 결과가 기록됨. 코드를 작성하거나 PR을 병합한 것만으로 출시됐다고 보고하지 않는다.
