# zzzystack

**목표: 자체 스킬과 외부 개발 스킬을 연결해, 24시간 자율적으로 작업하는 에이전트를 만드는 것.**

현재는 Codex와 Claude Code에서 사용할 기획·구현·검토·문서화 스킬과 설치·관리 도구를 개발하고 있습니다.

## 현재 진행 상태

버전 `0.10.0` · 개발 중

| 영역 | 현재 상태 | 남은 작업 |
|---|---|---|
| 스킬 | 22개 등록, 모두 개발 중 | 스킬별 내용 보완·실제 작업 평가 |
| 설치·관리 도구 | 설치·상태 관리·평가 코드 구현 | 로드맵의 완료 조건 충족 및 검증 |
| 전문 역할 | 역할 파일 5종 존재, 설치 미연결 | 역할 작성 완성·스킬 및 호스트 연결 |
| 자율 운영 | 장기 목표 | 스킬과 역할을 연결하고 동작 검증 |

구현 기록이 있는 항목도 전체 개발 완료를 뜻하지 않습니다. 현재 레지스트리에서 검증 완료로 등록된 스킬은 없으며, 구체적인 범위와 확인 이력은 [로드맵](../../../docs/roadmap.md)과 [구현·검증 기록](../../../docs/implementation-status.md)에서 관리합니다.

## 설치

Node.js 22 이상과 Git이 필요합니다. 별도의 `npm install`은 필요하지 않습니다.

```bash
git clone https://github.com/kangzzzy/zzzystack.git
cd zzzystack
npm run setup -- --host codex
```

Claude Code는 `--host claude`, 두 호스트는 `--host both`를 사용합니다. 기본은 사용자 계정 설치이며, 프로젝트 전용은 `--project "프로젝트 경로"`, 변경 전 확인은 `--dry-run`을 추가합니다. 이후 명령도 저장소 루트에서 실행합니다.

Windows PowerShell에서 npm 실행이 제한되면 `npm.cmd`로 실행합니다.

## 사용법

설치 후 Codex에서 필요한 스킬을 호출합니다. Claude Code에서는 `$` 대신 `/`를 사용합니다.

```text
$plan으로 이 아이디어의 첫 출시 범위를 정리해줘.
$implementation으로 합의한 기능을 구현해줘.
$review로 현재 변경 사항을 검토해줘.
```

## 상세 문서

- [개발 로드맵](../../../docs/roadmap.md): 목표·미완료 작업·범위 초안
- [구현 및 검증 기록](../../../docs/implementation-status.md): 구현 내용·검증 범위·남은 제약
