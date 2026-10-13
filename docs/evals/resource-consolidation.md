# 0.5.0 원칙·서식·설정 통합 검증

2026-10-13 (Asia/Seoul). 변경 전 전체 파일 1,211개를 ZIP으로 보존하고 파일별 SHA-256과 ZIP 무결성을 확인했다. 백업 이름은 `zzzystack-before-resource-consolidation-20261013-153638.zip`이며 이 세션의 Codex 출력 폴더 `backups/`에 manifest와 함께 보관했다.

## 변경과 보존

| 이전 원본 | 현재 원본 |
|---|---|
| principles/core.md, delegation.md | skills/zzzystack/references/core.md, delegation.md |
| templates/project.md, feature-map.md, decisions.md, delegation.md, report.md | skills/zzzystack/assets/ |
| templates/task.md | skills/build/assets/task.md |
| templates/design.md | skills/design/assets/design.md |
| templates/review.md | skills/review/assets/review.md |
| templates/handoff.md | skills/handoff/assets/handoff.md |
| config/project.example.json | skills/zzzystack/assets/project.example.json |
| docs/behavior-evals.md | tests/evals/scenarios.md |
| docs/onboard-evaluation.md, skill-consolidation.md | docs/evals/ |

원칙 2개·서식 9개·설정 예시 1개의 본문은 백업과 바이트가 일치한다. 설정은 스키마 버전 1과 키·기본값을 유지한다. 설정 안내만 새 참조로 추가해 정책 선언, 호스트 실행기 필요 사항, 실행 상태를 구분했다. 기존 9개 스킬 이름, 11개 전문 지침, 승인·독립 검토 경계, 자동화 프롬프트 3개를 유지한다.

설치기는 스킬 assets의 JSON·바이너리를 바이트 그대로 복사하고 Markdown 내부 링크만 설치 경로에 맞춰 변환한다. init은 PROJECT_TEMPLATES의 명시적 원본 목록으로 기존 출력 파일명을 유지한다. 새 asset 추가가 곧 프로젝트 초기화 파일 추가를 뜻하지는 않는다. 설정·서식 원본을 모두 읽고 검증한 뒤 대상에 쓰므로 원본 누락도 부분 초기화를 만들지 않는다.

## 실행 검증

- Windows, bundled Python 3.12.14. `python -m unittest discover -s tests -v`에 해당하는 절대 실행 경로 호출에서 33개 중 32개 통과. 심볼릭 링크 1개는 Windows 권한 제약으로 제외.
- `zzz.py validate`: 원본, 두 호스트 번들, 내부 링크, 설정 및 초기화 서식 존재 검사 통과.
- 공식 skill-creator quick_validate.py로 원본 9개·Codex 9개·Claude 9개, 총 27개 통과. bundled Python에는 PyYAML이 없어 기존 Python 3.11과 설치된 PyYAML을 읽기 전용으로 사용했다.
- 바이너리 fixture를 스킬 assets로 실제 설치해 디코딩 없이 모든 바이트가 유지되는지 확인했다. JSON은 배포 후 읽기·설정 검증까지 확인했다.
- 사용자 수정 JSON, 구 원칙·서식, 새 서식 경로, 백업 경로 충돌에서 양 호스트 쓰기 전 전체 중단과 파일 불변을 확인했다.
- 실제 백업의 0.4.0 CLI로 양 호스트를 설치하고 init한 뒤 0.5.0 CLI로 업그레이드했다. 호스트별 원칙·서식 11개의 구 경로가 정리됐고 .bak 바이트가 원본과 일치했다.
- 업그레이드 dry-run은 무변경, 실제 설치 후 프로젝트 설정·기록·학습 11개 파일은 불변, 재설치는 변경 0건이었다.
- 새 프로젝트에서 install/init dry-run은 파일을 생성하지 않았다. 실제 install/init은 config.json과 Markdown 9개를 만들었고 check-project가 통과했다.
- 기존 프로젝트의 init 재실행은 종료 코드 1로 거절하며 전체 파일을 보존했다. 누락 서식·잘못된 기본 설정도 부분 초기화 없이 중단했다.
- progress/report/resume 프롬프트를 실제 렌더링하고 프로젝트 기록 불변을 확인했다. 예약·실행·외부 전송은 하지 않았다.
- 저장소 dist의 기존 두 호스트 배포본을 실제로 갱신했다.

원시 명령·종료 코드·stdout/stderr·보존 결과는 `.test-work/resource-consolidation/integration-results.json`에 있다. 검증 프로젝트·구버전 추출 소스는 같은 시험 폴더에 격리했다. 테스트 결과물은 배포 번들에 포함하지 않는다.

독립 검토자 `/root/resource_migration_review`는 작성자 `/root`와 별도 세션에서 설치된 review 스킬과 이동된 지침을 읽고 검토했다. 격리 복제에서 33개 테스트·validate·build와 구버전 실제 설치 후 업그레이드를 수행했고 필수 수정 결함 없이 passed로 판정했다. 특히 구버전/현재 init 결과 10개의 파일명과 바이트가 모두 동일함을 확인했다. 기록은 시험 폴더 `review/review-record.md`에 있다. 최종 README/docs는 부모가 별도로 내부 링크 검사를 수행했다.

## 범위와 한계

이번에는 이동된 스킬 지침과 설치·업그레이드·초기화 동작을 검증했다. 실제 Claude Code의 자동 발견·호출, 새 제품의 전체 기능, 운영 배포는 검증 범위가 아니다. 기존 onboard 실행 평가는 [0.4.0 기록](skill-consolidation.md)에 보존한다. installer의 동시 변경·전원 장애 시 전체 트랜잭션 보장과 예약 실행기는 이번 변경에 포함하지 않는다.
