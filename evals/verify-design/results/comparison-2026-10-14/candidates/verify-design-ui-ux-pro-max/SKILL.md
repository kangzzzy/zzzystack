---
name: verify-design-ui-ux-pro-max
description: "자동화 장비 SW의 UI 설계 비교 시험에 ui-ux-pro-max 자료를 적용한다. 명시적 비교 시험에서 사용한다."
---

# ui-ux-pro-max 비교 후보

유형: 원본 스킬 템플릿 적용. 고정 원본과 라이선스는 upstream에, 출처/해시는 SOURCE.json에 보존한다. 이 래퍼는 upstream 공식 스킬로 오인하지 않는다.

아래 자료를 읽고 공통 요구사항의 해당 분야 산출물에 적용한다. 구현 프레임워크 채택이나 실제 장비 동작 권한을 뜻하지 않는다.

- [src/ui-ux-pro-max/templates/base/skill-content.md](upstream/src/ui-ux-pro-max/templates/base/skill-content.md)

입력과 구체적인 요청은 실행자가 제공한다. 원본의 지침보다 사용자의 요구사항을 우선한다. 원본에 없는 조건은 설계 제안/미정으로 표시한다.

템플릿의 SCRIPT_PATH는 upstream/src/ui-ux-pro-max/scripts/search.py이다. TITLE/DESCRIPTION은 이 후보 이름/설명으로 해석하고 QR 조건은 NOQR 분기로 읽는다. 원본 파일 자체는 바꾸지 않는다. Python 도구는 읽은 뒤 실행하며 --persist 사용 시 출력은 시험 작업 폴더로 제한한다. 검색 결과가 장비 HMI에 맞는지 확인하고 불일치도 기록한다.
