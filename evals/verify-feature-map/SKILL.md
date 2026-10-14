---
name: verify-feature-map
description: "Create or update a product Feature Map with stable feature IDs, scope, dependencies, acceptance criteria, and evidence for implementation, verification and release. Use for feature inventory or feature-level status tracking."
---

# Feature Map 관리

기능 목록과 기능별 구현·검증·출시 상태를 하나의 원본에서 관리한다. 요구사항 상세 분석은 [requirements](../../skills/requirements/SKILL.md), 개인 프로젝트 README의 진행 요약은 [progress](../verify-progress/SKILL.md)를 사용한다. Feature Map 작성만으로 기능 구현·이슈 등록·배포를 시작하지 않는다.

[공통 원칙](../../shared/core.md)을 읽고 사용자가 지정한 범위와 기존 결정을 따른다.

## 원본과 범위

기존 Feature Map 또는 지정된 외부 기록을 먼저 확인한다. 원본이 있으면 현재 형식·기능 ID·사용자 메모를 보존하며 갱신한다. 외부 원본에 접근할 수 없으면 갱신하지 못한 범위를 밝히고, 별도 원본을 만들지 않는다.

새로 작성할 때는 [양식](assets/feature-map.md)을 사용한다. 저장 위치는 프로젝트의 기존 규칙이나 사용자 지정을 따르고, 둘 다 없으면 `docs/feature-map.md`에 작성한다. 설치된 양식에 실제 프로젝트 데이터를 쓰지 않는다.

## 작성·갱신

1. 요청·기획·요구사항·현재 코드에서 근거가 있는 기능을 모은다. 사용자·관리자·외부 연동·백그라운드 처리 중 해당 범위를 포함하고 품질·보안·안전 요구는 관련 기능에 연결한다. 제안과 확정, 현재 동작과 목표 동작을 구분한다.
2. 기능별 ID, 사용자·권한, 입력·출력·상태·예외, 의존성, 출시 범위, 수용 기준을 정리한다. 기존 요구사항·설계·작업 원본은 복제하지 않고 ID나 링크로 연결한다. 근거가 없는 내용은 미정으로 둔다.
3. 기존 ID를 재번호화하거나 삭제된 ID를 다른 기능에 재사용하지 않는다. 분리·병합·제외한 기능은 기존 ID와 후속 ID의 관계·이유를 남긴다. 범위나 수용 기준의 실질적 변경은 제안으로 구분하고 기존 승인 근거를 재사용한다.
4. 구현·검증·출시를 각각 근거에 따라 갱신한다. 구현 완료를 테스트 통과나 출시 완료로 간주하지 않는다. 검증에는 대상 버전과 결과, 출시에는 실제 반영 버전과 근거를 연결한다. 관련 코드나 기준이 바뀌어 이전 검증이 유효하지 않으면 재검증 필요를 표시한다.
5. 중복 ID, 깨진 관계, 누락된 수용 기준과 근거 없는 완료 표시를 확인하고 변경한 기능·미정 사항·검증 한계를 보고한다.

완료: 요청한 기능 범위가 원본에 반영되고 기존 ID와 기록이 보존되며 상태를 근거로 추적할 수 있다. 미확인 항목을 남긴 문서 정리 완료와 기능 개발 완료를 구분한다.
