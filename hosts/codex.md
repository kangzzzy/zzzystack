# Codex 연결

사용자 계정 기본 설치 위치: `~/.agents/skills/`. 프로젝트 설치 위치: `<프로젝트>/.agents/skills/`. `$zzzystack` 또는 `$plan`처럼 호출한다. 실제 자동 선택·가용 도구는 호스트에 따른다.

공통 내용은 `zzzystack/references/`에 포함된다. 작업 절차는 각 `SKILL.md`, 전문 지침은 각 스킬의 `references/`에서 읽는다. 고정 agent TOML은 생성하지 않는다. 전역 설정·AGENTS.md·config.toml을 설치기가 수정하지 않는다.

독립 검토가 필요한 경우 호스트에서 허용한 별도 에이전트/세션을 사용한다. 해당 기능이 없으면 검토 패킷을 전달하고 대기한다. 도구를 사용할 수 있다고 가정해 가상의 검토 결과를 만들지 않는다.

공식 설치 위치 근거: https://learn.chatgpt.com/docs/build-skills (2026-10-12 확인).

별도 실행에는 [위임 방식](../skills/zzzystack/references/delegation-execution.md)에 따라 범용 작업자에게 스킬·전문 지침·공통 원칙·위임 계약을 전달한다. 검토 작업의 read-only 설정은 호스트가 작업별로 지원하는 경우 적용한다. 모델·권한을 이름만으로 추정하지 않는다.
