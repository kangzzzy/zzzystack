# zzzystack

![개발 중](https://img.shields.io/badge/status-in%20development-yellow) ![버전 0.10.0](https://img.shields.io/badge/version-0.10.0-blue)

- 목표: 24시간 자율적으로 작업하는 에이전트
- 방향: 자체 스킬과 외부 개발 스킬을 agent workflow에 연결
- 환경: Claude Code·Codex
- 상태: 사용자 검증 완료 스킬 2개 (`i-have-adhd`, `requirements`), 검증 후보 21개

## 설치

- 준비: Node.js 22 이상, 저장소 다운로드
- 실행 위치: 저장소 루트 폴더 (`npm install` 불필요)

```bash
npm run setup -- --host codex
```

- 대상: `--host codex` / `--host claude` / `--host both`
- 범위: 기본은 사용자 계정, 프로젝트 전용은 `--project "프로젝트 경로"` 추가
- 미리 확인: `--dry-run` 추가
- 업데이트: 저장소 갱신 후 같은 명령 재실행 (설치 범위별로 실행)
- 기본 설치: `i-have-adhd`, `requirements`와 필요한 공통 자료. `evals/` 후보는 제외
- PowerShell 실행 제한 시: `npm` 대신 `npm.cmd` 사용

## 사용 예시
- 호출: Codex `$스킬명` / Claude Code `/스킬명`

```text
$i-have-adhd를 적용해서 답부터 간결하게 설명해줘.
$requirements로 요구사항을 분석하고 검토용 초안을 작성해줘.
```

## 폴더 구성

```text
zzzystack/
├── skills/                검증된 스킬 2개
├── evals/                 verify-* 후보·공통 검사 규칙·평가 결과
├── agents/                전문 담당 역할 (작성 예정, 설치 미연결)
├── shared/                공통 규칙
├── hosts/                 호스트 연결
├── setup/                 관리 도구
├── skill-registry.json    스킬 상태
└── docs/                  로드맵·구현·검증 기록
```

자세한 내용: [개발 로드맵](docs/roadmap.md) · [평가 공통 규칙](evals/VERIFY.md) · [구현·검증 기록](docs/implementation-status.md)
