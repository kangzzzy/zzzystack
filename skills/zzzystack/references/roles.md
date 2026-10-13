# 전문 지침 목록

전문 지침은 해당 작업 스킬의 references에 둔다. 필요한 분야만 읽고 프로젝트의 기존 역할 배정을 재사용한다. 역할 이름은 전문 분야를 식별하며 설치된 agent 이름을 뜻하지 않는다. [위임 방식](delegation-execution.md)에 따라 필요할 때 범용 작업자에게 스킬·전문 지침·위임 계약을 전달한다.

역할은 프로젝트별로 선정한다. 공통 절차와 역할의 전문 판단을 분리한다. 기능별 전문 역할이 모든 프로젝트에 자동 배정되는 것은 아니다.

## Plan · 기획 및 설계

아래 항목은 별도 고정 agent가 아닌 직접 호출 가능한 작업 스킬이다. [Plan](../../plan/SKILL.md)에서 요청에 필요한 관점을 선택하며, 프로젝트의 기존 역할 배정은 유지한다.

| 관점 | 스킬 |
|---|---|
| 문제 정의 | [office-hours](../../plan/office-hours/SKILL.md) |
| CEO·창업자: 제품 방향·범위 | [plan-ceo-review](../../plan/plan-ceo-review/SKILL.md) |
| 시니어 디자이너: UX 계획 | [plan-design-review](../../plan/plan-design-review/SKILL.md) |
| 엔지니어링 매니저: 기술 계획 | [plan-eng-review](../../plan/plan-eng-review/SKILL.md) |

## 첫 구현: 웹 서비스

- [독립 검토자](../../github/review/references/reviewer.md)

- [웹 기획](../../plan/references/web-planner.md)
- [UX·UI 디자인](../../design/references/ux-ui.md)
- [웹 아키텍처](../../design/references/web-architect.md)
- [프런트엔드](../../build/references/frontend.md)
- [백엔드·API](../../build/references/backend.md)
- [DB 설계·관리](../../build/references/database.md)
- [웹·API 보안](../../github/review/references/web-security.md)
- [웹 QA](../../github/review/references/web-qa.md) — 초안
- [인프라·배포](../../github/release/references/deployment.md) — 초안
- [서비스 운영](../../github/release/references/service-operations.md) — 초안, harness의 Automations와 다름

## 확장 후보 — 아직 전문 절차를 구현하지 않음

| 분야 | 세분화 방향 |
|---|---|
| 제품·사업 | 분야별 제품 기획, 사업 전략·시장 조사·가격 정책 |
| SW | 모바일, 데스크톱, 데이터 엔지니어링, AI/ML·컴퓨터 비전 |
| 펌웨어 | BSP·드라이버, MCU·RTOS, 임베디드 Linux |
| 로봇·제어 | 로봇 기획·아키텍처, ROS 2, 운동학·동역학, 모션·서보, 인지·위치 추정, 동작 계획·행동, PLC·HMI·SCADA |
| 기계·물리 | 기구·구조·열, 소재·공정·공차, 제조 설비·치공구, 도면·BOM |
| 전기·전자 | 회로·PCB·전원·센서·전장·배선 |
| 시뮬레이션 | 모델, Isaac Sim 환경·센서·시나리오, 실물 정합성 |
| 보안 | 인프라, 임베디드·장치, 로봇·산업, 데이터·개인정보 |
| 시스템 안전 | 위험 분석, 안전 동작, 고장 대응, 검증·인증 대응 |
| 문서·전달 | 매뉴얼·기술 문서, 사업계획서, 슬라이드 |
| 분야별 QA | 장치, 로봇, 기계·전기, 시뮬레이션, 문서 |

새 분야 요청 시 웹 역할을 이름만 바꿔 사용하지 않는다. 책임·입력·산출물·협의 대상을 제안하고 확정 후 필요한 역할만 추가한다. 공통 교훈은 사용자 검토 후 한 프로젝트에서 시험한다.
