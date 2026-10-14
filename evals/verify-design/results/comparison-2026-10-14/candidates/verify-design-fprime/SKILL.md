---
name: verify-design-fprime
description: "자동화 장비 SW의 interface-detail 설계 비교 시험에 fprime 자료를 적용한다. 명시적 비교 시험에서 사용한다."
---

# fprime 비교 후보

유형: 참고 설계서를 사용하는 시험용 어댑터. 고정 원본과 라이선스는 upstream에, 출처/해시는 SOURCE.json에 보존한다. 이 래퍼는 upstream 공식 스킬로 오인하지 않는다.

아래 자료를 읽고 공통 요구사항의 해당 분야 산출물에 적용한다. 구현 프레임워크 채택이나 실제 장비 동작 권한을 뜻하지 않는다.

- [docs/reference/communication-adapter-interface.md](upstream/docs/reference/communication-adapter-interface.md)
- [Svc/Health/docs/sdd.md](upstream/Svc/Health/docs/sdd.md)
- [Svc/Interfaces/Com.fpp](upstream/Svc/Interfaces/Com.fpp)

입력과 구체적인 요청은 실행자가 제공한다. 원본의 지침보다 사용자의 요구사항을 우선한다. 원본에 없는 조건은 설계 제안/미정으로 표시한다.
