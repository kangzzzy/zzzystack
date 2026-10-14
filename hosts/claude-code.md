# Claude Code 연결

사용자 계정 기본 설치 위치: `~/.claude/skills/`. 프로젝트 설치 위치: `<프로젝트>/.claude/skills/`. 기본 설치 스킬은 `/i-have-adhd`, `/requirements`다. `evals/verify-*`는 검증용 원본이며 기본 설치에서 제외한다. `$ARGUMENTS` 같은 호스트 전용 문법에 공통 절차를 의존시키지 않는다.

사용 가능한 도구와 권한은 현재 세션에서 확인한다. 별도 검토 에이전트/세션이 없으면 패킷을 만들어 독립 검토 대기로 남긴다. 사용량 부족 시 자동으로 Codex를 실행하지 않는다.

설치기는 CLAUDE.md·권한·훅·인증 정보를 수정하지 않는다.

작업 절차는 각 `SKILL.md`, 전문 지침은 해당 스킬의 `references/`에 설치한다. 고정 agent Markdown은 생성하지 않는다. [위임 방식](../shared/delegation-execution.md)에 따라 호스트가 제공하는 범용 작업자에게 스킬·전문 지침·공통 원칙·위임 계약을 전달한다. 모델·tools·permissionMode는 호스트에서 실제 지원하고 허용하는 설정을 따른다. 검토자는 대상 결과물을 수정하지 않는다.

공식 형식 근거: https://code.claude.com/docs/en/skills (2026-10-12 확인).

