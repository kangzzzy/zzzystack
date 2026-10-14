---
name: verify-ship
description: "Manage an issue-driven development workflow from GitHub issue through local implementation, pull request, review, merge and release. Use for a complete delivery request or a specific stage; stop at the user's requested endpoint."
---

# 이슈부터 출시까지

기본 순서는 이슈 등록 → 로컬 작업 → PR → 리뷰·수정 → 병합 → 출시 확인이다. 현재 상태에서 필요한 단계부터 시작하고, 사용자가 요청한 단계까지만 수행한다. PR 생성 요청을 병합·배포 요청으로 확대하지 않는다.

## 시작과 권한

프로젝트 지침, 현재 브랜치·변경, 원격 저장소, 관련 이슈·PR, 완료 조건과 기존 승인을 확인한다. [공통 원칙](../../shared/core.md)과 [GitHub 연결](../../shared/github.md)을 따른다. 공개·개인 프로젝트 여부를 저장소 공개 범위만으로 추정하지 않는다.

도구는 사용 가능한 GitHub 연결 또는 인증된 `gh`를 사용한다. 사용자 변경과 다른 작업의 파일을 보존한다. 기존 이슈·브랜치·PR을 재사용하고 같은 작업을 중복 등록하지 않는다. 외부 연결이 없으면 가능한 로컬 작업과 초안을 끝내고 미등록·미실행 상태를 보고한다.

이미 승인된 단계는 반복 승인 없이 진행한다. 권한이 없는 외부 변경이나 범위가 불명확한 병합·배포는 실행하지 않으며, 필요한 초안·검증·복구 방법을 준비한 뒤 미해결 선택만 묻는다. push·태그·병합이 배포를 시작하는지 프로젝트 자동화 설정을 먼저 확인한다.

## 단계별 선택

| 작업 | 적용할 지침 | 확인할 결과 |
|---|---|---|
| 이슈 등록·정리 | [이슈 관리](references/issues.md) | 이슈와 완료 조건, 작업 범위 |
| 브랜치·로컬 구현·커밋 | [Git 작업](references/git.md), [구현](../verify-implementation/SKILL.md) | 해당 이슈에 속한 변경과 검증 |
| 테스트 우선 구현 | [TDD](../verify-tdd/SKILL.md) | 의도한 실패 → 통과 → 개선 후 재검증 |
| PR 생성·갱신·CI 대응 | [PR·병합](references/pull-request.md) | 실제 변경을 설명한 PR과 검증 결과 |
| 코드 리뷰 | [독립 검토](../verify-review/SKILL.md) | 해당 변경 버전의 발견 사항과 해결 상태 |
| 병합·이슈 마무리 | [PR·병합](references/pull-request.md) | 원격 병합 결과와 완료 조건 충족 여부 |
| 태그·릴리스·환경 반영 | [출시 연결](references/release.md), [배포](../verify-release/SKILL.md) | 실제 반영 버전과 정상 동작·복구 결과 |
| 개인 프로젝트 완료 기록 | [진행 기록](../verify-progress/SKILL.md) | 요청되거나 프로젝트 정책에 정해진 README 갱신 |

필요한 참조만 읽는다. 리뷰어는 수정하지 않고 작성자가 피드백을 반영한다. 검토 후 변경된 부분은 재검증하며 독립 검토가 불가능하면 `review_pending`으로 남긴다. 검토가 필요한 병합·배포를 자기 검토만으로 완료 처리하지 않는다.

## 문서와 완료 보고

사용법·설정·API·운영 동작이 바뀌면 해당 문서를 같은 변경에서 갱신한다. 문서 작성 때문에 무관한 파일 전체를 다시 쓰지 않는다. README 진행 기록은 기존 이슈·검증 근거를 요약하며 별도의 완료 기준을 만들지 않는다.

관련 이슈·브랜치·커밋·PR·CI·병합·배포 중 이번 범위에 해당하는 결과와 링크를 보고한다. 로컬 구현, 원격 업로드, 병합, 운영 반영을 각각 구분한다. 실행하지 않은 단계는 완료로 표시하지 않는다.
