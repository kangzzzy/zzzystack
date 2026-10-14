# 0.10.0 구현 상태

## 미검증 스킬 분리 — 2026-10-14

- 사용자 검증 완료인 `i-have-adhd`와 `requirements`는 `skills/`에 유지하고, 기존 20개 스킬은 `evals/verify-*`로 이동했다. 기존 README 실험본을 포함해 후보는 21개이며 원래 README 스킬은 `verify-readme-base`로 보존한다.
- 기본 설치는 두 정식 스킬과 필요한 종속 자료만 포함한다. 후보는 레지스트리·평가 기능에 남기되 기본 설치와 활성화에서 제외한다. 원본 자산과 평가 이력은 보존하고 링크와 이름을 갱신했다. 사용자 채택과 CLI 자동 평가 상태는 구분한다.
- 이전 설치에서 관리하던 후보 자료는 재설치 시 해시를 확인해 백업·정리하고, 수정된 파일은 충돌로 보호한다. 실제 전역 설치본은 이번 작업에서 변경하지 않았다.
- 검증: 소스 및 npm pack 추출 패키지의 validate 통과. 전체 회귀는 작업공간 임시 경로에서 통과했으며 Windows junction 생성 검사는 권한 제한으로 생략했다. 기본 OS 임시 경로 실행은 평가 결과 파일 rename EPERM으로 중단되어 작업공간 경로로 재실행했다.
- 독립 검토에서 패키지에 evals 누락을 지적받아 수정했고 재검토 결과 필수 지적은 없었다. 이후 항목은 이전 구현 이력이다.

## workflow 제거 — 2026-10-14

- 사용자가 삭제한 `skills/workflow/`에 맞춰 README 안내와 CLI의 이전 경로 이동 처리를 제거했다. 알려진 설치본의 업무 안내 파일은 해시 확인 후 백업·제거하며, 사용자 수정 파일은 기존 충돌 보호를 따른다.
- workflow는 독립 스킬로 등록된 적이 없어 레지스트리는 20개로 유지한다. 이후 항목은 이전 구현 이력이다.
- 검증: validate·구문·README 링크 검사와 전체 `.github/verify.mjs` 회귀를 통과했다. 독립 검토 `/root/review_shared`에서도 필수 수정 사항이 없었다. 실제 사용자 계정 재설치는 수행하지 않았다.

## 통합 진입점 제거·공통 규칙 분리 — 2026-10-14

- 사용자가 삭제한 zzzystack 스킬을 복원하지 않고 공통 원칙과 위임 규칙만 `shared/`로 옮겼다. 공통 원칙은 이전 패키지의 원본을 보존했고 위임 문서는 참조 경로를 갱신했다. GitHub 공통 지침은 `skills/github/references/`에서 관리한다.
- `skills/workflow/common/`을 유지하고 누락된 상위 README를 작성했다. 삭제된 회사별 업무와 역할 색인은 복원하지 않았다. 개별 스킬·호스트·README의 참조와 패키지 배포 경로를 갱신했다.
- 레지스트리에서 삭제된 진입점을 제거하고 공통 참조 변경을 동기화했다. 현재 독립 스킬은 20개, 내장 DOCX 지침을 포함한 SKILL.md는 21개다. 이전 설치 자원은 해시가 일치할 때만 백업 후 이동·제거하고 실제 프로젝트 기록은 보존한다.
- `__pycache__/`, 옛 `dist/`, 빈 `tests/`, `skills/maintain/` 예약 폴더와 이전 요청에서 생성한 `.test-work/cleanup-package/`를 정리했다. 과거 평가 문서와 나머지 실험·백업·로그는 보존했다. 이후 항목은 이전 구현 이력이다.
- 검증: 소스 및 npm pack 추출 패키지의 validate, 문서 링크 검사, 양 호스트 번들의 구 경로 부재와 레지스트리 20개 일치를 확인했다. 전체 `.github/verify.mjs`는 Windows junction을 허용하는 임시 환경에서 통과했다. 공유 규칙 변경 시 스킬 fingerprint 무효화와 설치·이전 리소스 백업·기록 보존·평가·활성화 회귀를 포함한다. 빌드는 테스트의 임시 경로에서 검증하여 루트의 옛 dist를 다시 만들지 않았다.
- 독립 검토 `/root/review_shared`는 필수 수정 사항 없음으로 판정했다. 독립 실행은 validate와 설치·업그레이드·기록 보존 검사 후 샌드박스의 junction EPERM에서 중단됐으며, 작성자의 전체 회귀 통과와 구분한다. 실제 사용자 계정 재설치와 호스트 세션 로딩, 다른 OS 실행은 수행하지 않았다.

## 프로젝트 관리 제거·Feature Map 분리 — 2026-10-14

- 프로젝트·결정·보고 양식, 프로젝트 설정 예시와 설정·산출물 관리 안내를 제거했다. CLI의 init·check-project·automation 명령과 자동화 pack을 제거하고 스킬 설치·평가·활성화 기능은 유지한다.
- feature-map을 독립 스킬로 분리하고 양식을 해당 스킬 assets로 옮겼다. 독립 스킬은 21개이며 내장 DOCX 지침을 포함한 SKILL.md는 22개다.
- 업무 정의는 skills/zzzystack/workflow/로 옮기고 common과 companies/insstek 구조를 유지한다.
- 설치 업그레이드는 알려진 관리 원본이 수정되지 않았을 때만 백업·정리하며, 대상 프로젝트의 실제 기록은 보존한다. 아래는 이전 구현·검증 이력이다.
- 검증: `node setup/cli.js validate`, feature-map의 `quick_validate.py`, 배포 묶음 build, npm pack 후 추출한 패키지 CLI validate를 통과했다. `node .github/verify.mjs`는 Windows 샌드박스의 junction 생성 제한(EPERM)으로 중단된 뒤 제한 밖의 임시 환경에서 전체 통과했다. 제거 명령 거부, 두 호스트의 이전 리소스 백업·이동, 사용자 수정 충돌 시 무변경, 기존 제품 기록 보존과 재설치 변경 0건을 확인했다.
- 독립 검토자 `/root/review_cleanup`은 현재 작업트리를 요구사항과 대조하고 validate·skills list를 실행했으며 필수 수정 사항을 발견하지 않았다. 새 feature-map 스킬은 개발중으로 등록했다. 실제 호스트의 새 세션 로딩과 기능 지도 작성 행동 평가는 수행하지 않았다.

## 스킬 상태·전후 비교 평가·세션 적용 — 2026-10-14

- 소스 파일은 `skill-registry.json`, `setup/eval.js`, `setup/session.js` 세 개만 추가했다. 상태·활성화 명령은 기존 CLI, 테스트는 기존 `.github/verify.mjs`, 사용법은 README에 통합했다. npm 패키지에 등록부와 새 실행 코드를 포함했다.
- 독립 설치 스킬 20개를 개발중으로 등록했다. 내장 DOCX 지침을 포함한 SKILL.md 파일 수는 21개다. i-have-adhd 3개, onboard 2개의 평가 항목을 준비했으며 나머지 스킬의 평가 항목은 아직 비어 있다. 실제 행동 평가 없이 기존 설치 이력만으로 검증 완료로 바꾸지 않았다.
- baseline/candidate의 독립 임시 환경 실행, 익명 채점, 텍스트 산출물 필수 검사, 예산·시간·실패 기록, 현재 내용 해시·평가 기준·실행기 일치 검사를 구현했다. 실제 실행 시에만 실행 위치의 `.test-work/evals/<ID>/result.json`을 생성한다. 재실행은 새 ID이며 중단된 실행의 자동 재개는 제공하지 않는다.
- 선택한 범위의 activation.json과 설치 파일 해시를 바탕으로 SessionStart 지침을 생성한다. enable/disable은 기존 사용자 훅·권한을 보존하며 install과 별도 명령이다. 훅 미리보기와 실제 호스트 새 세션 적용을 구분하고, 검증 완료에는 실제 CLI 평가와 수동 새 세션 확인 근거가 필요하다.
- Windows에서 `npm run validate`, `npm test`, JavaScript 구문 검사, npm pack 후 패키지의 validate·평가 dry-run을 통과했다. 회귀 검사는 임시 패키지·모의 실행으로 상태 전환, 예산·채점 실패, 오래된 근거 거부, 실제 Node 훅 출력, 기존 훅 보존을 확인했다. 실제 모델 유료 평가와 Codex/Claude 새 세션의 네이티브 훅 실행은 미실행이며 사용자 홈 설정도 변경하지 않았다. 원격 CI 및 macOS/Linux 실행은 미확인이다.

## 소프트웨어 개발 단계와 산출물 — 2026-10-14

- `skills/build/`를 `skills/implementation/`으로 변경하고 `skills/github/release/`를 `skills/release/`로 분리했다. 스킬·호스트·공통 기록의 관련 링크와 CLI init의 작업 서식 원본을 갱신했다. release는 내부 GitHub 참조에서 ship·review·progress를 연결한다.
- requirements·test 스킬과 Excel 양식 3개, Word 양식 4개를 추가했다. 요구사항은 사용자 요구와 상세 요구, 테스트는 항목·실행 결과·버그·재검증을 연결한다. 설계에는 시스템·DB·UI 문서를 정의했고, UI 시안은 Figma를 원본으로 연결한다. DB가 없으면 DB 문서를 생략한다.
- `maintain/`은 `.gitkeep`만 둔다. 설치 가능한 유지보수 스킬이나 절차는 아직 없다. 양식은 각 스킬에 배포되며 실제 프로젝트 문서는 작업 시 작성한다. init의 공통 기록 출력 수는 유지했다.
- 소스·두 호스트 배포 링크 및 설정 검사, Windows 설치 검사, 기존 0.9 배포 묶음에서의 업그레이드, 프로젝트 기록 보존과 재설치 변경 0건을 확인했다. build 구 경로는 관리 해시가 일치할 때 백업·제거하며 사용자가 수정한 파일은 충돌 보호를 따른다.
- Excel은 렌더와 내보내기 후 재가져오기 검사를 했다. 1:N 연결·누락/중복 ID·예약 마지막 행·테스트 재실행 연결을 확인했다. HYPERLINK는 계산 엔진에서 미구현이므로 생성된 이동 대상 인수까지 확인했으며 실제 Excel 클릭은 미확인이다.
- Word는 4개 파일의 ZIP·XML·표 구조를 확인했으나 Windows 런타임에 LibreOffice가 없어 `render_docx.py`가 실패했다. 페이지 배치 시각 검증은 미완료이며 최종 양식으로 사용하기 전 Word에서 확인해야 한다. 실제 사용자 계정 설치·원격 CI·Git 푸시는 수행하지 않았다.

## Plan 스킬 추가 — 2026-10-13

- `skills/plan/` 아래에 office-hours·plan-ceo-review·plan-design-review·plan-eng-review를 추가했다. gstack의 역할 구분을 참고해 자체 절차로 작성했으며, Plan 진입점·통합 라우팅·역할 목록·README를 연결했다. 설치 가능한 스킬은 총 17개다.
- 두 호스트에 각 스킬을 최상위 경로로 배포한다. 기존 plan 진입점과 웹 기획 참조 경로는 유지한다. 설치 검증에 네 스킬의 직접 발견 가능 여부를 추가했다.
- 소스·배포 링크·설정 검증, build와 Windows 로컬 설치 검증을 수행했다. 사용자/프로젝트 범위·호스트 분리·재설치 변경 0건·충돌 보호 검사는 통과했다. 실제 사용자 계정 설치와 스킬의 독립 대화 행동 평가는 수행하지 않았다.

## 0.9.0 개발 루틴·README 진행 기록

- GitHub 개발 흐름의 ship·review·tdd·release·progress 원본을 `skills/github/` 아래로 묶었다. 설치기는 기존 최상위 스킬 경로로 변환하므로 호출 이름과 설치 경로는 유지한다. 상대 링크·중첩 assets 수집·review init 서식 경로를 갱신했다. 로컬 설치 검증과 이전 패키지에서 업그레이드, 설치 리소스 일치, 기존 프로젝트 기록 보존, 재설치 변경 0건을 확인했다.

- ship을 추가해 이슈 등록 → 로컬 구현 → PR → 리뷰 대응 → 병합 → 출시를 연결했다. 요청한 종료 단계와 기존 승인을 따르며 Git·이슈·PR·출시 지침은 필요한 참조만 읽는다.
- tdd는 실제 실패 확인 → 최소 구현 → 개선 후 재검증을 안내한다. 기존 review에는 코드 리뷰 참조를 추가하고 build·공통 진입 스킬의 연결을 갱신했다.
- progress는 개인 프로젝트 README의 완료 체크리스트와 날짜별 진행 이력을 관리한다. 실제 근거로 구현·검증·병합·출시를 구분하고 확인되지 않은 완료 상태나 날짜를 만들지 않는다. 기존 기록을 보존하며 반복 실행 시 중복을 방지한다.
- 12개 스킬 형식과 소스·배포 링크 검사가 통과했다. Windows Node 24에서 npm 패키지의 사용자/프로젝트 설치·호스트 선택·init·충돌 보호·경로·설정·프롬프트·build 검증이 통과했다.
- 실제 0.8 npm 설치본에서 0.9로 두 호스트를 갱신해 새 스킬·참조·서식 설치, 기존 README·프로젝트 기록 보존, 재설치 변경 0건을 확인했다. 검증 산출물은 `.test-work/delivery-skills/`에 있다. tests/는 빈 폴더다.
- 실제 사용자 홈 설치, GitHub 이슈·PR·병합·배포 및 새 스킬의 독립 대화 행동 평가는 실행하지 않았다. 원격 CI와 macOS·Linux 네이티브 실행은 확인하지 않았다.

아래는 이전 버전의 구현·검증 이력이다.

## 0.8.0 Node.js·사용자 기본 설치

- 관리 구현을 `setup/cli.js`로 전환하고 Python 소스와 pyproject.toml을 제거했다. Node.js 22+ 내장 기능만 사용하며 추가 npm 의존성은 없다. package.json에 npm 실행 명령과 setup 실행 파일 등록을 정의했다.
- 저장소에서 `npm run setup -- --host codex`로 즉시 설치한다. 기본 범위는 현재 사용자 홈이며 `--project PATH`를 지정하면 프로젝트에만 설치한다. Codex는 .agents/skills, Claude Code는 .claude/skills를 사용한다. 대상 범위와 경로를 출력한다.
- `install --target PATH`는 기존 프로젝트 설치 별칭으로 유지한다. init은 명시적으로 요청해야 하며 설치 시 자동으로 실행하지 않는다. 프로젝트·사용자 설치본 사이의 자동 삭제·이동·갱신은 없다.
- 기존 파일 해시 검사, 충돌 시 두 호스트 전체 사전 중단, 이전 경로 백업·정리, dry-run, 재설치 변경 0건, 설정 검증과 자동화 프롬프트 출력을 유지했다.
- 동일 원본에 대한 Python/Node 스킬 번들의 바이트 해시를 대조했다. 실제 Python 0.7 설치본을 Node로 갱신하고 기존 설정·학습 기록 보존을 확인했다.
- Windows Node 24.14.1에서 소스 및 npm 패키지 설치본의 사용자/프로젝트 범위·호스트 선택·init·충돌 보호·경로 탈출·junction·종료 코드·설정·프롬프트·build를 검증했다. npm이 생성한 setup.cmd도 실행했다. 사용자 홈은 임시 경로로 대체했고 실제 계정 스킬은 변경하지 않았다.
- CI는 Windows·macOS·Linux와 Node 22·24 조합에서 npm 패키지를 설치해 검증하도록 구성했다. 로컬 macOS·Linux 및 원격 CI 결과는 아직 확인하지 않았다. tests/는 계속 빈 폴더이며 CI 검증 코드는 .github/verify.mjs에 있다.
- 변경 전 원본 및 전환 근거는 `.test-work/node-migration/`에 보존했다. 설치 방법은 README를 따른다. npm 레지스트리에는 게시하지 않았다.

아래는 이전 버전의 구현·검증 이력이다.

## 0.7.0 TOML 기반 설치

- `pyproject.toml`에서 배포 패키지 `zzzystack`과 공통 실행 명령 `setup`을 선언했다. 루트의 `setup/` 소스는 유지하고 설치 패키지에서는 `zzzystack` 이름을 사용한다.
- 스킬·호스트 지침·자동화·서식·VERSION을 wheel 안에 포함한다. 설치된 CLI는 저장소에 의존하지 않고 동봉된 리소스를 읽는다. build 결과는 현재 작업 디렉터리의 dist/에 생성한다.
- 수동 관리하던 setup.sh·setup.cmd를 제거했다. README에 Windows·macOS·Linux 가상환경 설치·활성화·업데이트·삭제 방법과 호스트 지정 설치를 안내한다. setup 스킬은 추가하지 않았다.
- wheel 내 리소스를 원본 바이트와 대조하고, sdist에서 wheel을 다시 빌드했다. 격리 가상환경에 wheel을 설치한 뒤 저장소 밖에서 호스트 3종 설치·dry-run·재설치·init·설정 검사·자동화·충돌 보호·종료 코드·build를 확인했다.
- Windows 로컬 검증 통과. CI는 Windows·macOS·Linux에서 wheel을 빌드·설치하고 생성된 setup 명령을 검증하도록 변경했다. 원격 CI 및 macOS·Linux 네이티브 실행 결과는 아직 확인하지 않았다.
- 사용자 전역 환경에는 설치하지 않았다. 검증 산출물과 로그는 `.test-work/toml-packaging/`에 있다. tests/는 빈 폴더로 유지한다.

아래는 이전 버전의 구현·검증 이력이다.

## 0.6.0 호스트·관리 명령 정리

- Windows용 `setup.cmd`, macOS·Linux용 `setup.sh`를 추가했다. 기존 Python 관리 코드를 호출하고 Python 3.11+ 탐색·인자·종료 코드를 처리한다. `ZZZYSTACK_PYTHON`으로 실행 파일 경로를 지정할 수도 있다.
- `install --host codex|claude|both`를 지원하며 생략 시 both다. 상대 대상 경로는 호출한 작업 디렉터리를 기준으로 한다.
- Windows CMD와 Git Bash에서 각 호스트 설치, dry-run, 재설치, 한글 프로젝트 이름으로 init, 설정 검사, 자동화 프롬프트, 충돌 보호, 종료 코드, PATH 탐색·잘못된 Python 경로를 확인했다. Codex만 재설치할 때 사용자 수정이 있는 Claude 설치본도 변경되지 않음을 확인했다.
- CI를 Windows·macOS·Linux 3종으로 확장하고 각 OS 실행 파일을 통한 기능 검증을 추가했다. macOS·Linux 네이티브 실행 및 원격 CI 결과는 아직 확인하지 않았다. `tests/`는 계속 빈 폴더다.

- 루트 adapters/를 hosts/로 옮기고 모든 스킬의 연결을 갱신했다.
- scripts/cli.py를 setup/cli.py로 옮겼다. zzz.py는 제거하고 `python -m setup`을 관리 명령 진입점으로 사용한다. 기존 하위 명령과 옵션은 유지한다.
- tests/의 모든 내용을 백업 후 삭제하고 빈 디렉터리만 유지했다. CI는 실행 파일을 통한 설치·초기화·파일 보호와 validate·build를 검증한다.
- 기존 설치본의 알려진 adapters 참조 4개를 호스트별로 해시 검증·백업 후 hosts로 전환한다.
- 백업본 테스트를 임시 디렉터리에 추출해 import 경로만 변경하고 실행했다. 33개 중 32개 통과, Windows 심볼릭 링크 권한으로 1개 제외. 실행 후 임시 테스트는 제거했다.
- 실제 0.5.0 CLI로 설치·init한 프로젝트를 두 호스트 모두 업그레이드했다. 참조 8개 백업의 바이트 일치, 프로젝트 기록 보존, dry-run 무변경, 재설치 변경 0건을 확인했다.
- 새 CLI의 help·validate·build·install·init·check-project·automation 3개 pack을 실행했다. 이전 경로·새 경로·백업 경로의 사용자 수정 충돌 3가지에서 두 호스트 모두 쓰기 없이 중단했다. 두 번째 build는 변경 0건이었다.
- 검증 환경: 로컬 Windows, Python 3.12.14. 원격 CI와 실제 호스트 대화 행동은 이번 변경에서 실행하지 않았다.
- 검증 로그: `.test-work/setup-rename/regression.log`, `.test-work/setup-rename/integration.json`. 변경 전 전체 3,004개 파일을 외부 ZIP으로 보존하고 파일별 SHA-256을 대조했다. 위치는 `.test-work/setup-rename/backup.json`에 기록했다.

아래는 이전 버전의 구현·검증 이력이다.

## 0.5.0 공통 원칙·서식·설정 통합

- principles/의 두 문서를 skills/zzzystack/references/로 이동했다.
- templates/의 9개 서식을 소유 스킬의 assets/로 이동하고 공통 서식은 zzzystack에 뒀다.
- project.example.json을 zzzystack/assets/로 이동했다. 스키마·키·기본값은 변경하지 않고 정책과 실제 실행 상태의 차이를 configuration.md에 설명했다.
- 설치기에 JSON·바이너리 assets 지원, 이전 원칙·서식 11개의 해시 기반 백업·전환을 추가했다. init의 기존 출력 10개와 사용자 프로젝트 기록을 유지한다.
- 행동 평가 시나리오는 tests/evals/, 이전 평가 결과는 docs/evals/로 정리했다.
- 로컬 Python 3.12.14로 테스트 33개 중 32개 통과, Windows 심볼릭 링크 권한으로 1개 제외. 실제 0.4.0 CLI 설치·init 후 두 호스트 업그레이드와 새 설치·init을 확인했다.
- 상세 근거와 검증 한계는 [리소스 통합 검증](evals/resource-consolidation.md)에 기록한다.

아래는 이전 버전의 구현·검증 이력이다.

## 0.4.0 스킬 중심 통합

- 기존 9개 스킬의 호출 이름을 유지하고 9개 workflow 본문을 해당 SKILL.md에 합쳤다.
- 전문 역할 11개의 책임·입력·산출물·협의·경계를 소유 스킬의 references로 옮겼다. 최상위 agents/와 workflows/ 원본을 제거했다.
- 고정 네이티브 agent 생성 대신 범용 작업자에게 스킬·전문 지침·공통 원칙·위임 계약을 전달한다. 독립 검토, 비수정 원칙, 위임 불가 시 review_pending은 유지한다.
- 설치 시 알려진 이전 관리 파일만 해시 검증 후 .bak으로 보존·정리한다. 사용자 파일 보호, 두 호스트 전체 사전 검사, dry-run, 재설치 멱등성을 유지한다.
- 테스트 26개 중 25개 통과, Windows 심볼릭 링크 생성 권한으로 1개 건너뜀. 27개 원본·배포 스킬 형식 검사 통과.
- 실제 0.3.1 Codex/Claude 배포본 전환에서 각각 이전 파일 32개 원본 보존과 재설치 변경 0건을 확인했다.
- 상세 근거와 행동 검증 범위는 [스킬 통합 검증](evals/skill-consolidation.md)에 기록한다.

아래는 이전 버전의 구현·검증 이력이다.

## 0.3.1 이름 정리

개별 스킬·에이전트의 `zzz-` 접두사를 제거했다. 기존 관리 진입 파일은 해시 확인 후 `.bak`으로 보존하고 이름을 전환한다. 사용자 수정·동명 충돌·dry-run 보호는 유지한다. 아래 행동 평가의 원시 기록은 평가 당시 이름을 보존한다.

이름 전환·백업·재설치 멱등성·사용자 수정/충돌 시 전체 사전 중단을 포함한 테스트 21개 통과, Windows 심볼릭 링크 권한으로 1개 건너뜀. 기존 배포본도 새 이름으로 빌드했다. 통합 진입점 `zzzystack`은 유지한다.

## 0.3.0 추가: 프로젝트 초기 셋업·학습

- `onboard` 한 개를 추가해 호스트별 스킬은 9개다. 기존 역할 11개와 설치기는 유지한다.
- 초기 셋업, 실행 없는 학습, 기존 지식 갱신을 하나의 절차에서 구분한다.
- 프로젝트별 `knowledge.md`, 근거 파일 SHA-256 목록, 실행별 보고서를 남긴다.
- 기존 zzzystack 작업은 관련 프로젝트 지식을 읽고 원본과 대조하도록 연결했다.
- 원본과 두 호스트 배포본 27개 스킬 형식 검증, 패키지·참조 검증, 기존 테스트 18개 통과·1개 Windows 심볼릭 링크 권한으로 건너뜀.
- 기능의 행동 검증 범위와 한계는 [초기 셋업·학습 평가](evals/onboard-evaluation.md)에 기록한다.

아래는 0.2.0 당시의 구현·검증 이력이다. 0.3.0의 행동 평가는 전체 호스트 발견·자동 선택·장기 운영 인증을 의미하지 않는다.

## 0.2.0 이력

## 구현

- 단일 진입점과 절차 직접 호출: 호스트별 스킬 8개
- 공통 원칙과 역할의 점진적 로딩, 전문 에이전트 11개
- 최상위 agents/·skills/ 원본, workflows/·principles/·templates/·adapters/ 분리
- Claude Code Markdown / Codex TOML 네이티브 에이전트 출력과 절차별 위임 패킷
- 두 호스트용 동일 원본 빌드·프로젝트 단위 설치
- 사용자 파일 보존, 전체 충돌 사전 검사, 재설치 멱등성, dry-run
- 프로젝트 기록 초기화와 설정 검증
- progress/report/resume 자동화 지침과 읽기 전용 프롬프트 렌더러
- Windows/Linux CI 정의

## 이번 검증

- 두 호스트 묶음·모든 내부 참조 링크·설정 검증
- 공식 skill-creator quick_validate.py로 원본 8개·호스트별 8개, 총 24개 SKILL.md 검증
- 설치·초기화·파일 보호·설정·프롬프트·에이전트 변환 테스트 18개 통과, 1개 권한 제약으로 건너뜀
- Codex TOML 파싱과 두 호스트의 에이전트 이름·위임 계약 검증
- 별도 에이전트의 읽기 전용 검토 및 임시 폴더 설치 시험
- 독립 검토에서 발견한 상위 경로 충돌 시 부분 설치 문제 수정·재검증

로컬 Windows에서 심볼릭 링크 생성 권한이 없어 해당 테스트는 건너뛰었다. Linux/Windows CI는 정의했으며 아직 원격에서 실행하지 않았다. 실제 Claude Code/Codex 새 세션에서의 스킬 발견·대화 행동 평가는 아직 하지 않았다. 당시 행동 평가 목록의 현재 위치는 당시 `tests/evals/scenarios.md`(0.6.0에서 백업 후 삭제)다.

## 아직 실행하거나 구현하지 않은 것

- 전역 설치, 실제 제품 생성, GitHub 이슈/PR 생성, 외부 배포
- 예약 활성화, 장기 실행 데몬, 비용 계량·강제 중단, 전체 프로젝트 자원 분배 실행기
- Notion·Obsidian 직접 연동
- 로봇·CAD 등 확장 후보의 전문 작업 도구와 절차

이 버전은 실제 설치·사용 가능한 지침형 harness다. 호스트의 모델 실행과 권한 체계 위에서 동작하며, 지침만으로 모든 런타임 제약이 강제되지는 않는다.
