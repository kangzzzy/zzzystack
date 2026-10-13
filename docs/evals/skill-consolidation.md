# 0.4.0 스킬 중심 통합과 검증

2026-10-13, Windows / Python 3.11. 변경 전 전체 703개 파일을 ZIP으로 보존하고 각 파일의 SHA-256과 ZIP 무결성을 확인했다.

백업: `zzzystack-before-skill-consolidation-20261013-111638.zip`과 인접 `.manifest.json`. 이 세션의 Codex 시각화 출력 폴더 `backups/`에 보관한다.

## 구조와 보존 범위

| 이전 원본 | 현재 원본 |
|---|---|
| workflows/routing.md | skills/zzzystack/SKILL.md |
| workflows/{작업}.md | skills/{작업}/SKILL.md |
| agents/web-planner.md | skills/plan/references/web-planner.md |
| agents/web-architect.md, ux-ui.md | skills/design/references/ |
| agents/frontend.md, backend.md, database.md | skills/build/references/ |
| agents/reviewer.md, web-qa.md, web-security.md | skills/review/references/ |
| agents/deployment.md, service-operations.md | skills/release/references/ |
| agents/index.md | skills/zzzystack/references/roles.md |

11개 역할 본문은 agent 등록용 frontmatter를 제거한 것 외에 변경 없이 보존했다. onboard 절차는 본문 전체가 이전 workflow와 동일하다. 다른 절차는 기존 작업 단계·완료 조건을 유지하며 링크와 전문 지침 선택 방식을 변경했다. 독립 검토 스킬에는 이미 위임받은 검토자가 재귀적으로 검토자를 생성하지 않도록 실행 위치를 구분했다.

9개 작업 스킬 이름, 프로젝트 config 스키마·기록 템플릿·자동화 프롬프트 명령은 유지한다. Feature Map·승인·자원 한도·도구 전환·학습 저장·독립 검토 경계도 유지한다. 원칙·템플릿·호스트 연결은 여러 스킬이 공유하므로 별도로 두고 배포 시 zzzystack/references에 포함한다.

고정 agent 이름 호출은 해당 작업 스킬과 전문 지침 선택으로 바뀐다. 새 설치는 네이티브 agent 프로필을 만들지 않는다. 기존 Codex 고정 검토 프로필의 read-only sandbox가 범용 실행에 자동 승계되지는 않는다. 위임 시 호스트가 지원하는 읽기 전용 설정을 적용하고, 지원하지 않으면 비수정 지침과 실제 검증 한계를 명시한다.

## 설치·전환 검증

- `python zzz.py validate`: 원본·Codex/Claude 번들의 스킬 형식, 내부 링크, 설정 통과.
- `python -m unittest discover -s tests -v`: 26개 중 25개 통과, 심볼릭 링크 테스트 1개는 Windows 권한 제약으로 건너뜀.
- skill-creator의 quick_validate.py: 원본 9개 + Codex 9개 + Claude 9개, 총 27개 통과.
- 실제 변경 전 0.3.1 배포본을 별도 폴더로 복사해 두 호스트를 각각 업그레이드했다. 호스트당 92개 파일 연산, 이전 파일 32개 백업 바이트 일치, dry-run 파일 무변경, 재설치 변경 0건.
- 새 설치에서 agent 디렉터리 미생성, 사용자 소유 agent 보존, 관리 파일 사용자 수정 보호, 새 참조·백업 경로 충돌 시 양쪽 호스트 무변경, 알 수 없는 관리 리소스 보존, 이전 zzz- 이름 전환을 검증했다.
- 저장소 dist의 두 호스트 배포본도 실제로 갱신했다. 백업은 활성 스킬·agent 파일명 대신 .bak 확장자로 남긴다.

자동 테스트는 설치 결과와 파일 보호를 확인한다. 모든 모델의 지침 준수나 모든 제품 분야의 실제 동작을 증명하지 않는다. 설치기의 기존 전원 장애 시 전체 트랜잭션 부재는 그대로다.

독립 검토자 `skill_migration_review`도 백업에 들어 있는 실제 구 CLI로 양쪽 호스트 설치본을 만든 뒤 새 CLI로 전환·바이트 보존·재설치 변경 0건을 확인했고 필수 결함 없음으로 판정했다. 작성자와 별도 세션이며 대상 코드를 수정하지 않았다. 검토 당시 scripts/cli.py SHA-256은 `dbf4f92c1aa1c547ee484a9b110905b6fadc934ffd923401b5d5350109facd7e`다. 원시 기록은 시험 폴더의 `review/review.md`에 있다. junction, 동시 변경, 적용 중 I/O 실패 복구는 검증하지 않았다.

## 실제 행동 평가

격리된 `.test-work/skill-consolidation/onboard-project`에 새 Codex 스킬 묶음을 설치하고 독립 평가 세션에 설치된 onboard 경로와 사용자 요청만 전달했다.

`skill_onboard_eval`은 초기 셋업·학습을 수행했다. 기존 Python으로 설치 없이 빈 목록, 추가·공백 정리, 프로세스 간 저장 유지, 빈 제목 거부, 없는 ID 거부, 완료 처리, 완료 후 조회의 7개 확인을 모두 통과했다. 실제 명령·출력·종료 코드·저장 전후 상태는 실행별 checks.json에 있다. 제품 README.md와 todo.py는 원본 fixture와 바이트가 일치했고 임시 데이터는 정리됐다.

지식, 원본 해시, 실행별 보고서와 고정 sources.json을 생성했다. 이번 확인은 모델이 설치된 스킬을 명시적으로 읽고 실행한 Codex 평가이며 네이티브 자동 발견·자동 선택이나 Claude Code 새 세션 실행 인증은 아니다.

이후 시험 복사본에서 CLI 옵션을 --title에서 --label로 변경하고 JSON 저장 유지·SQLite 전환 금지 사용자 메모를 추가했다. 새 세션 `skill_refresh_eval`이 학습만 갱신하여 새 옵션을 반영하고 사용자 메모를 보존했다. 설치·Python·앱·테스트는 실행하지 않고 not_run으로 기록했으며 이전 성공을 현재 버전의 성공으로 재사용하지 않았다. 부모도 갱신 전 해시와 비교해 지식 두 파일 외 기존 파일 전부가 보존되고 현재 원본 해시가 일치함을 확인했다.

평가 원시 기록과 migration-results.json은 `.test-work/skill-consolidation/`에 보존한다. 이 경로는 Git에서 제외된다. 이전 버전의 행동 평가는 [onboard 평가 이력](onboard-evaluation.md)을 참고한다.
