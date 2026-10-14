---
name: verify-documentation
description: "문서화 작업용 스킬 모음. 현재 Word 문서 및 템플릿(.docx, .dotx)의 생성, 읽기, 편집, 서식, 주석, 변경 추적을 지원한다. 문서화 스킬을 명시적으로 요청하거나 Word 파일을 다룰 때 사용한다. 일반 채팅 글쓰기나 코드 문서화에는 자동 적용하지 않는다."
---

# 문서화

요청한 문서 형식에 해당하는 지침만 읽는다. 현재 포함된 형식은 DOCX이다. 다른 형식은 해당 지원을 추가하기 전까지 이 스킬이 지원한다고 가정하지 않는다.

## DOCX · Word 문서

Word 문서와 템플릿 생성, 읽기, 편집, 주석, 변경 추적 작업은 [Anthropic DOCX 지침](references/docx/SKILL.md)을 읽고 수행한다. 원본의 스크립트, XML 템플릿, 검증 스키마를 `references/docx/`에 함께 보관한다.

- 원본 지침의 `scripts/...` 경로는 이 파일이 아닌 `references/docx/`를 기준으로 해석한다. 절대 경로로 스크립트를 호출하고 입력·출력 파일은 사용자 작업 폴더에 둔다.
- 원본은 Unix 명령과 사전 설치된 도구를 가정한다. 현재 운영체제와 사용 가능한 실행 파일을 확인하고, Windows에서는 PowerShell 또는 Python으로 동등한 작업을 수행한다.
- Codex의 `load_workspace_dependencies` 도구가 있으면 Python, Node.js 및 문서 라이브러리 경로를 먼저 확인한다. `docx`, Pandoc, LibreOffice, Poppler가 실제로 사용 가능한지 확인하고 필요한 도구만 준비한다.
- 기존 문서를 편집할 때는 원본을 보존하고 요청된 범위만 변경한다. 완성된 파일은 구조 검증과 렌더링 확인을 수행한다. 검증 도구를 사용할 수 없으면 수행하지 못한 확인을 명확히 알린다.

## 출처

- 원본: https://github.com/anthropics/skills/tree/main/skills/docx
- 가져온 날짜: 2026-10-14 (`main` 스냅샷)
- 원본 이용 조건: [LICENSE.txt](references/docx/LICENSE.txt)

새 문서 형식을 추가할 때는 해당 지침과 필요한 리소스를 별도 하위 폴더에 넣고, 여기에 적용 조건과 링크를 추가한다.