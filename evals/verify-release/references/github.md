# GitHub 연결

GitHub를 사용하는 프로젝트에서만 적용한다. [공통 GitHub 연결](../../../shared/github.md)의 도구·권한 기준을 따른다.

- PR·CI·병합이 필요하면 [ship](../../verify-ship/SKILL.md)의 해당 단계와 [PR 절차](../../verify-ship/references/pull-request.md)를 적용한다.
- 코드 검토가 필요하면 [review](../../verify-review/SKILL.md), 개인 프로젝트 README 기록이 요청되면 [progress](../../verify-progress/SKILL.md)를 적용한다.
- 태그·GitHub Release·패키지 게시에는 [출시 연결](../../verify-ship/references/release.md)의 버전·권한 기준을 적용한다. 이미 수행한 이슈·PR·병합을 반복하지 않는다.
- ship에서 release로 진입했다면 완료한 단계와 대상 커밋을 전달받고 남은 배포만 수행한다. 출시 연결에서 release로 돌아왔을 때 ship 전체를 재호출하지 않는다.
- GitHub Release 게시와 실제 서비스 운영 반영을 구분한다. 이 문서가 새 원격 변경 권한을 부여하지 않는다.
