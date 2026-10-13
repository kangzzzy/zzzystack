# zzzystack

Claude Code와 Codex에서 함께 쓰는 개인용 AI harness. 기획·설계·구현·독립 검토의 절차와 전문 역할을 재사용하고, 디자인·Feature Map·결정 이유를 작업 사이에 유지합니다.

**현재 버전: 0.9.0.** 설치 가능한 스킬 17개와 스킬에 포함된 전문 지침 11개(일부 초안), 프로젝트 기록 템플릿, 별도 Automations pack 3개와 로컬 관리 CLI를 제공합니다. 작업 절차·전문 판단·공통 원칙·서식을 스킬 중심으로 관리합니다.

## 빠른 시작

Node.js 22 이상만 필요합니다. Python·Bun·추가 npm 패키지는 필요하지 않습니다. Node.js 설치 후 저장소를 내려받아 루트에서 실행하세요. 기본은 현재 사용자 계정 설치이며, 프로젝트를 지정하면 해당 프로젝트에만 설치합니다. 일반 사용자 권한으로 대상 폴더에 쓸 수 있으면 관리자 권한은 필요하지 않습니다.

Windows 일반 CMD:

```cmd
npm run setup -- --host codex
```

macOS·Linux 터미널:

```bash
npm run setup -- --host codex
```

PowerShell에서 npm.ps1 실행이 제한되면 `npm.cmd run setup -- --host codex`를 사용하세요. 가상환경 생성이나 `npm install` 없이 실행됩니다. `--host claude`는 Claude Code만, `--host both`는 둘 다 설치하며 생략 시 `both`입니다.

| 설치 범위 | Codex | Claude Code |
|---|---|---|
| 사용자 계정 — 기본 | `~/.agents/skills/` | `~/.claude/skills/` |
| 프로젝트 지정 | `<프로젝트>/.agents/skills/` | `<프로젝트>/.claude/skills/` |

`~`는 현재 OS 사용자의 홈 폴더입니다. 사용자 설치는 그 계정의 여러 프로젝트에서 사용할 스킬을 준비합니다. 프로젝트 설치는 사용자 설치본을 이동하거나 삭제하지 않습니다. 동일 이름의 스킬을 두 위치에 설치하면 호스트에서 중복으로 보일 수 있으므로 범위 선택을 구분하세요. 설치 위치 근거: [Codex](https://learn.chatgpt.com/docs/build-skills), [Claude Code](https://code.claude.com/docs/en/skills).

프로젝트에만 설치하려면:

```text
npm run setup -- --project "프로젝트 경로" --host both
```

쓰기 없이 설치 예정 위치를 확인하려면 `--dry-run`을 추가합니다. 실행 전 출력되는 `Scope`와 호스트별 경로로 적용 범위를 확인할 수 있습니다. `--project`에는 경로가 필요하며 상대 경로는 명령을 호출한 위치가 기준입니다. 기존 `install --target PATH`도 프로젝트 설치 별칭으로 유지합니다. `--user`와 `--project`는 함께 사용할 수 없습니다.

설정·기록 서식이 필요한 프로젝트만 별도로 초기화합니다. 스킬 설치만으로 초기화하지 않습니다.

```text
npm run setup -- init --project "프로젝트 경로" --name "프로젝트 이름"
npm run setup -- check-project --project "프로젝트 경로"
npm run validate
```

업데이트는 저장소를 최신 내용으로 갱신한 뒤 같은 설치 명령을 다시 실행합니다. 사용자 설치를 갱신해도 별도로 설치한 프로젝트 복사본은 바뀌지 않으므로, 그 프로젝트에는 `--project`를 지정해 다시 실행합니다. 기존 프로젝트 기록에는 `init`을 반복하지 않습니다.

관리 구현은 `setup/cli.js`, 패키지·실행 명령 정의는 `package.json`에 있습니다. 저장소 밖에서는 `node "저장소 경로/setup/cli.js" --project "프로젝트 경로"`처럼 실행할 수 있습니다. npm 패키지로 설치하면 `setup` 명령이 등록됩니다. 아직 npm 레지스트리에 게시하지 않았으므로 설치 원본은 이 저장소입니다.

기존 Python 가상환경의 `setup` 명령은 구버전입니다. 새 설치는 위 npm 명령으로 실행하세요. 필요하면 기존 가상환경의 Python으로 `-m pip uninstall zzzystack`을 실행해 구 관리 도구만 제거할 수 있습니다. Node.js 설치기는 기존 가상환경을 자동 삭제하지 않습니다.

선택하지 않은 호스트·AGENTS.md·CLAUDE.md·호스트 권한·프로젝트 기록은 변경하지 않습니다. 같은 내용을 다시 설치하면 변경 0건이며, 사용자 수정이나 충돌이 있으면 덮어쓰지 않고 중단합니다.

스킬은 접두사 없는 기존 이름을 유지하며 통합 진입점은 `zzzystack`입니다. 고정 agent 파일은 새로 만들지 않습니다. 이전 버전의 알려진 관리 agent·workflow·역할 참조·공통 원칙·서식·호스트 연결과 `zzz-` 스킬 진입점은 해시가 일치할 때만 같은 설치 루트의 `.zzzystack-renamed/`에 `.bak`으로 보존하고 이전 파일을 제거합니다. 새 경로·백업 경로 충돌이나 사용자 수정이 있으면 두 호스트의 쓰기를 시작하기 전에 중단합니다. 관리되지 않은 파일과 알 수 없는 이전 리소스는 보존합니다.

`init`은 선택 사항입니다. 해당 프로젝트 `.zzzystack/`에 설정·기록 템플릿을 만들며 기존 기록이 있으면 중단합니다. 기본 설정은 미승인·자동화 비활성 상태입니다. 역할·한도·도구·반영 정책을 합의한 뒤 갱신합니다. 이 저장소 자체에 제품용 프로젝트 기록을 만들 필요는 없습니다.

서식의 원본 위치가 바뀌어도 `init`의 출력은 기존 `config.json`과 Markdown 기록 9개로 같습니다. `install`·업그레이드는 프로젝트 `.zzzystack/`의 설정·결정·학습 기록을 변경하지 않습니다. [설정 안내](skills/zzzystack/references/configuration.md)에서 정책 선언과 실제 실행 기능의 차이를 확인할 수 있습니다.

호스트의 스킬 목록이 갱신된 후 대상 프로젝트에서 호출합니다.

| 목적 | Codex | Claude Code |
|---|---|---|
| 통합 진입 | `$zzzystack` | `/zzzystack` |
| 기획 | `$plan` | `/plan` |
| Plan · 문제 정의 | `$office-hours` | `/office-hours` |
| Plan · 제품 방향·범위 검토 | `$plan-ceo-review` | `/plan-ceo-review` |
| Plan · UX·디자인 검토 | `$plan-design-review` | `/plan-design-review` |
| Plan · 기술 설계 검토 | `$plan-eng-review` | `/plan-eng-review` |
| 설계 | `$design` | `/design` |
| 구현 | `$build` | `/build` |
| 이슈→로컬 작업→PR→병합→출시 | `$ship` | `/ship` |
| 테스트 우선 구현 | `$tdd` | `/tdd` |
| 개인 프로젝트 README 진행 기록 | `$progress` | `/progress` |
| 독립 검토 | `$review` | `/review` |
| 코드·분야 입문, 프로젝트 초기 셋업·학습 | `$onboard` | `/onboard` |
| 반영·배포 | `$release` | `/release` |
| 조사 | `$investigate` | `/investigate` |
| 인수인계 | `$handoff` | `/handoff` |
| 집중하기 쉬운 한국어 응답 | `$i-have-adhd` | `/i-have-adhd` |

예: `zzzystack을 사용해서 새 제품의 첫 출시 범위를 함께 기획해줘.` 개별 호출은 전체 제품 절차를 강제하지 않습니다. 독립 검토에는 호스트에서 제공하고 허용하는 별도 에이전트/세션이 필요합니다. 가용하지 않으면 검토 패킷을 만들고 대기합니다.

[i-have-adhd](skills/i-have-adhd/SKILL.md)는 [원본 스킬](https://github.com/ayghri/i-have-adhd)을 한국어로 맞춤화한 응답 스타일입니다. 답부터 말하고, 단계를 작게 나누고, 진행 상태를 짧게 보여 줍니다. `$i-have-adhd를 적용해서 설명해줘`처럼 작업 스킬과 함께 사용하며, 현재 대화에서 모드를 켠 뒤 `일반 모드`라고 하면 해제합니다. ADHD 진단을 전제하지 않습니다. [원본 MIT 라이선스](skills/i-have-adhd/LICENSE.md)를 함께 배포합니다.

## 구성과 수정 위치

```text
skills/zzzystack/            통합 진입점·스킬 선택·전문 지침 목록
skills/github/              ship·review·tdd·release·progress 스킬 묶음
skills/plan/                Plan 진입점·문제 정의·제품/UX/기술 계획 검토 묶음
skills/<작업>/SKILL.md       호출 조건·핵심 절차·완료 기준 (묶음 내부 포함 총 17개)
skills/zzzystack/references/ 공통 원칙·위임 계약·설정 안내
skills/zzzystack/assets/     공통 프로젝트 서식·project.example.json
skills/<작업>/references/    필요한 경우 읽는 전문 지침 (총 11개)
skills/<작업>/assets/        build·design·review·handoff·progress의 산출물 서식
hosts/                   Codex·Claude Code 호스트별 연결
automations/                실행·보고·재개 pack
setup/cli.js              빌드·설치·검증 구현
package.json               npm 패키징·setup 명령 등록
tests/                      비워 둔 테스트 디렉터리
docs/                       현재 구현 상태·설명
docs/evals/                 버전별 검증 이력
```

작업 절차·전문 지침·공통 원칙·서식은 `skills/`에서 직접 수정합니다. 공유 원칙·위임 절차·GitHub 연결 지침·서식은 `zzzystack` 스킬에 두고 다른 스킬에서 링크합니다. Codex·Claude Code별 연결 지침은 `hosts/`에 유지합니다. 설치 결과를 직접 편집하지 말고 원본을 수정한 뒤 검증·재설치합니다. 설치된 파일의 로컬 변경은 충돌로 보고하므로 먼저 차이를 원본에 반영하거나 별도로 보존하세요. 사용자 수정 파일을 자동으로 지우거나 `--force`로 덮어쓰지 않습니다. 설치기는 변경 전 충돌을 검사하지만 전원 장애에 대한 전체 트랜잭션 설치기는 아닙니다.

`npm run build`는 현재 작업 디렉터리의 `dist/codex/`, `dist/claude/`에 호스트별 배포 묶음을 생성합니다. 직접 절차 스킬은 `zzzystack/references/`를 공유하므로 묶음 전체를 함께 설치해야 합니다. 스킬 설치는 사용자가 실행한 명령의 범위에만 적용하며 마켓플레이스 배포는 하지 않습니다.

설치기는 Markdown의 내부 링크를 호스트별 위치로 변환하며 JSON·바이너리 등 `assets/` 파일은 원본 바이트로 포함합니다. 프로젝트 초기화 서식을 추가할 때는 `setup/cli.js`의 `PROJECT_TEMPLATES`에도 출력 파일명과 원본 경로를 등록해야 합니다. 모든 asset이 자동으로 프로젝트 기록으로 생성되지는 않습니다.

## Plan · 기획 및 설계

[Plan](skills/plan/SKILL.md) 아래에 네 개의 개별 스킬을 묶었습니다. gstack의 역할 구분을 참고해 zzzystack의 기존 기록·승인·설계 절차에 맞춰 작성했으며, gstack 자체 설치는 필요하지 않습니다.

| 스킬 | 목적 |
|---|---|
| [office-hours](skills/plan/office-hours/SKILL.md) | 실제 사용자 문제·근거·가정을 확인하고 해결 접근과 첫 검증을 정리 |
| [plan-ceo-review](skills/plan/plan-ceo-review/SKILL.md) | 제품 가치와 출시 범위를 확대·선택적 확대·유지·축소 관점에서 검토 |
| [plan-design-review](skills/plan/plan-design-review/SKILL.md) | 구현 전 사용자 여정·화면 상태·접근성·UX 수용 기준 검토 |
| [plan-eng-review](skills/plan/plan-eng-review/SKILL.md) | 구현 전 구조·데이터 흐름·실패 대응·검증 계획 검토 |

`$plan`으로 필요한 절차를 선택하거나 각 스킬을 직접 호출합니다. 모든 요청에 네 단계를 강제하지 않습니다. 기존 `design`은 상세 설계 작성, `review`는 구현된 결과물의 독립 검토를 담당합니다. Plan의 검토 결과만으로 구현이나 배포를 시작하지 않습니다.

원본은 `skills/plan/<스킬>/`에 두며 설치 시 각 호스트의 최상위 스킬 경로로 변환합니다. 기존 `plan` 호출과 `plan/references/` 경로는 유지합니다. 이미 같은 이름의 외부 스킬이 설치되어 있으면 설치기가 충돌을 보고하며 덮어쓰지 않습니다.

예: `$plan으로 첫 출시를 기획해줘.` 또는 `$plan-eng-review로 이 구현 계획의 위험과 테스트 전략을 검토해줘.`

## 개발 루틴과 개인 프로젝트 기록

관련 스킬 원본은 `skills/github/<스킬>/`에 모아 관리합니다. 설치기는 각 스킬을 호스트의 기존 최상위 스킬 경로에 배치하고 상대 링크를 변환하므로 `$ship`, `$review`, `$tdd`, `$release`, `$progress` 호출 이름과 기존 설치 경로는 유지됩니다.

[ship](skills/github/ship/SKILL.md)은 이슈 등록 → 로컬 작업 → PR → 리뷰·수정 → 병합 → 출시를 연결합니다. 요청한 단계까지만 진행하며, 실제 환경 반영은 기존 release 절차를 따릅니다. 이슈 등록·Git 작업·PR/CI/병합·출시 연결은 각각의 reference로 나눴습니다.

[tdd](skills/github/tdd/SKILL.md)는 의도한 실패 테스트 확인 → 최소 구현 → 개선과 재검증을 수행합니다. 기존 코드를 지워 TDD 과정을 다시 만들지 않으며, 실행하지 못한 테스트를 통과했다고 보고하지 않습니다. [review](skills/github/review/SKILL.md)는 코드·테스트·오류 처리·데이터/권한·설계·문서를 변경 범위에 맞게 독립 검토합니다.

[progress](skills/github/progress/SKILL.md)는 개인 프로젝트 README의 완료 체크리스트와 날짜별 이력을 관리합니다. 기존 이슈·검증·릴리스 근거를 요약하며, 구현·검증·병합·출시를 구분합니다. 같은 사건을 중복 기록하지 않고 미확인 날짜와 완료 상태를 만들어내지 않습니다. [기본 서식](skills/github/progress/assets/readme-progress.md)은 새 진행 섹션이 필요할 때만 사용합니다. CLI init의 기존 프로젝트 기록 10개는 유지합니다.

사용 예:

> 이 이슈를 $ship으로 로컬 작업하고 PR까지 올려줘. 구현은 $tdd로 진행해줘.

> $review로 이 PR을 코드 리뷰해줘. 코드는 수정하지 마.

> 개인 프로젝트야. $progress로 README에 완료 체크리스트와 진행 이력을 정리해줘. 근거가 없는 항목은 미완료로 남겨줘.

현재 저장소에 스킬을 추가한 것만으로 외부 이슈·PR 생성·병합·배포를 실행하지 않습니다. 프로젝트에서 해당 작업을 요청하면 기존 권한과 프로젝트 정책에 따라 수행합니다.

## 첫 커스텀 기능: onboard

코드·프로젝트 온보딩과 공부할 분야의 입문을 지원합니다. 비유 없이 용어를 처음 등장할 때 풀어 설명하고, 핵심과 필요한 실제 사례를 간결하게 전달합니다. 설명만 요청하면 설치나 기록 파일 생성을 하지 않습니다.

> `$onboard`로 이 코드의 입력부터 결과까지 흐름을 처음 보는 사람도 이해하게 설명해줘.

> `$onboard`로 통계의 가설 검정을 처음부터 설명해줘. 비유 없이 핵심 개념과 작은 실제 사례로 알려줘.

공통 설명 규칙과 분야 선택은 [onboard 스킬](skills/onboard/SKILL.md)에 모으고, 분야별 참조는 `references/` 바로 아래에 둡니다. [코드·프로젝트](skills/onboard/references/code.md)는 기존 셋업·기록 절차를 담당합니다.

분야 학습에는 [프로그래밍](skills/onboard/references/programming.md), [통계](skills/onboard/references/statistics.md), [경제학](skills/onboard/references/economics.md) 참조가 있으며, 요청에 해당하는 파일만 읽습니다. 공통 설명 규칙은 공유하고 각 분야의 설명 기준은 별도로 관리합니다.

pstack의 구조·실행 흐름 파악과 gstack의 프로젝트별 학습 보존 아이디어를 하나의 초기 셋업·학습 스킬로 만들었습니다. 프로젝트에서 다음처럼 요청합니다.

> `$onboard`로 이 프로젝트를 처음 셋업하고 구조와 개발 규칙을 학습해줘. 로컬 실행을 확인하고 다음 세션이 쓸 기록을 남겨줘.

> `$onboard`로 이 프로젝트를 학습만 해줘. 설치하거나 서비스를 실행하지 마.

> `$onboard`로 기존 학습 기록을 현재 코드에 맞춰 갱신해줘. 내 메모와 결정은 유지해줘.

기본 기록은 `.zzzystack/knowledge.md`와 원본 해시 목록 `knowledge-sources.json`입니다. 실행·조사 근거는 `.zzzystack/onboarding/runs/<unique-run-id>/`에 남깁니다. 사용자 지정 기록 위치가 있으면 그 원본을 따릅니다. 제품 코드·호스트 지침·기존 승인 설정은 학습 때문에 변경하지 않습니다.

초기 셋업은 기존 도구로 로컬 환경을 준비하고 작은 실행 확인을 합니다. 학습만 요청하면 설치·서비스 시작 없이 조사합니다. 이후 zzzystack 작업은 관련 지식을 읽고 원본과 대조합니다. 학습 기록은 모델 훈련이나 호스트의 자동 메모리가 아니며, 실행 준비 확인은 전체 기능 QA를 의미하지 않습니다.

[초기 셋업·학습 스킬](skills/onboard/SKILL.md), [기존 행동 평가 결과](docs/evals/onboard-evaluation.md)를 참고하세요. 관리 CLI의 `init`은 기록 틀 생성, `validate`는 패키지 검사이며 이 스킬의 조사·실행을 대신하지 않습니다.

## 프로젝트 기록과 자동화

모든 제품은 Feature Map을 가지며 구현·검증·출시를 별도로 추적합니다. 프로젝트 기록 도구는 선택 가능합니다. Notion·Obsidian 등 외부 기록을 사용하면 프로젝트 기준에 원본 위치를 적어 중복 기준을 방지합니다. 현재 외부 기록 서비스 커넥터는 포함하지 않습니다.

```powershell
npm run setup -- check-project --project "PATH"
npm run setup -- automation report --project "PATH"
```

Automations 명령은 **호스트에 전달할 실행 지침을 출력**합니다. 예약하거나 에이전트를 실행하지 않습니다. [활성화 계약과 한계](automations/README.md)를 읽으세요. 별도 스케줄러·비용 계량·프로젝트 잠금·외부 상태 중복 방지 연결이 있어야 실제 무인 운영을 시작할 수 있습니다. 지침만으로 금액 한도나 365일 가동을 보장하지 않습니다.

설정의 08시·18시, Asia/Seoul, 순차 개발 등은 변경 가능한 예시 기본값입니다. 프로젝트별 정책·사용자 승인 없이 자동 실행을 켜지 않습니다.

## 확장과 검증

[전문 지침 목록](skills/zzzystack/references/roles.md)의 로봇·펌웨어·CAD·전기·시뮬레이션 등은 확장 후보입니다. 필요할 때 전문 지침과 해당 분야 검증 절차를 추가합니다. 웹 아키텍트를 로봇 아키텍트로 이름만 바꿔 적용하지 않습니다.

공통 규칙 변경은 승인 → 한 프로젝트에서 시험 → 결과 확인 → 확산을 따릅니다. 실제 호스트 동작은 프로젝트에서 별도로 확인하세요. `tests/`의 기존 내용은 백업 후 삭제했습니다. `npm run validate`는 패키지·링크·설정을 검사하며 모델의 지침 준수를 증명하지 않습니다.

## 참고

- [gstack](https://github.com/garrytan/gstack), [pstack](https://github.com/cursor/plugins/tree/main/pstack): 개인 작업 방식의 재사용이라는 아이디어 참고
- [Benny](https://github.com/cursor/plugins/tree/main/pstack/automations/benny): 자동화 소스·프로젝트 설정 분리 참고
- [pstack how](https://github.com/cursor/plugins/blob/main/pstack/skills/how/SKILL.md), [gstack learn](https://github.com/garrytan/gstack/blob/main/learn/SKILL.md.tmpl): `onboard`의 구조 학습·프로젝트 지식 갱신 아이디어 참고
- [Codex skills](https://learn.chatgpt.com/docs/build-skills), [Claude Code skills](https://code.claude.com/docs/en/skills): 설치 형식 (2026-10-12 확인)

외부 저장소 코드를 복제하지 않았습니다.


## 전문 지침과 agent 실행

| 스킬 | 포함하는 전문 지침 |
|---|---|
| plan | 웹 기획 |
| design | 웹 아키텍처, UX·UI |
| build | 프런트엔드, 백엔드·API, DB |
| review | 독립 검토, 웹 QA, 웹·API 보안 |
| release | 배포, 서비스 운영 |

`onboard`, `investigate`, `handoff`, `ship`, `tdd`, `progress`와 통합 진입점은 자체 절차를 갖습니다. DB 설계처럼 여러 단계에서 필요한 전문 지침은 다른 스킬에서도 원본을 링크해 읽습니다.

예: `$build로 백엔드 변경을 구현해줘.` 또는 `$review로 이 결과물을 독립 검토해줘.` 스킬이 필요한 전문 지침을 선택합니다. 기존 역할의 책임·입력·산출물·경계는 보존했지만 `backend`, `reviewer` 같은 고정 agent 이름을 호출하는 인터페이스는 작업 스킬 호출로 바뀌었습니다.

별도 맥락·분리 가능한 구현·독립 검토가 필요하면 [위임 연결](skills/zzzystack/references/delegation-execution.md)에 따라 호스트의 범용 작업자에게 스킬과 전문 지침을 전달합니다. 검토자는 대상 결과물을 수정하지 않으며 호스트가 작업별 read-only 설정을 지원하면 적용합니다. 기존 Codex 고정 프로필의 sandbox 설정이 범용 실행에 자동 승계되는 것은 아닙니다. 별도 실행이 불가능하면 독립 검토를 `review_pending`으로 남깁니다.

[0.5.0 원칙·서식·설정 전환 검증](docs/evals/resource-consolidation.md)과 [0.4.0 스킬 통합 이력](docs/evals/skill-consolidation.md)에 보존 범위와 실제 확인 결과를 기록합니다.

