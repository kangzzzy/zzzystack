---
name: review
description: "Independently review code, pull requests or other artifacts against requirements, covering correctness, tests, error handling and documentation, and classify actionable findings."
---

# 독립 검토

코드·PR 요청에는 [코드 리뷰](references/code-review.md)를 적용한다. 코드 작성자의 리뷰 대응과 수정은 [PR 절차](../ship/references/pull-request.md)를 따른다.

모든 독립 검토에는 [검토자 기준](references/reviewer.md)을 적용한다. 웹 기능·회귀 검증은 [QA](references/web-qa.md), 인증·권한·공격 표면 검토는 [보안](references/web-security.md)을 범위에 따라 추가한다. 검토자는 대상 결과물을 수정하지 않는다.

[공통 원칙](../../zzzystack/references/core.md)을 읽고 요청 범위와 기존 결정을 따른다. 별도 실행이 필요하면 [위임 방식](../../zzzystack/references/delegation-execution.md)을 적용한다.

[위임 방식](../../zzzystack/references/delegation-execution.md)에 따라 범용 작업자에게 이 스킬과 필요한 검토 지침을 전달한다. 부모가 호출 결과를 받고 원래 기준과 대조한다.

작성자가 아닌 별도 에이전트/세션을 사용한다. 같은 Claude Code 또는 Codex도 가능하다. 작성자 세션에서 이 스킬을 시작했다면 실행 환경에서 위임이 허용되고 가능할 때 검토자를 호출한다. 이미 별도 검토자로 위임받았다면 직접 아래 검토를 수행하며 다시 위임하지 않는다. 별도 실행이 불가능하면 검토 패킷을 만들고 `review_pending`으로 남긴다.

검토 패킷: 원래 요청·기준, 기능 ID, 산출물/변경 식별자, 테스트 명령·관찰 결과, 알려진 제한. 작성자의 결론을 정답으로 주지 않는다. 리뷰 범위 밖의 수정·배포 권한을 주지 않는다.

1. 원래 기획·디자인·Feature Map·완료 조건을 직접 확인한다.
2. 결과와 근거를 대조하고 필요한 독립 검증을 수행한다.
3. 발견 사항을 필수 수정 / 추가 개선 / 사용자 판단 필요로 나눈다. 필수 수정에는 기준 위반·영향·재현 또는 증거를 첨부한다.
4. 작성자에게 수정 요청 후 변경 부분과 영향받는 범위를 재검증한다.
5. [검토 기록](assets/review.md)에 검토자·대상 버전·결과·미검증을 남긴다.

완료: 필수 결함이 해결되고 수용 기준을 충족한다. 취향 변경은 차단 결함이 아니다. 검토 뒤 대상이 바뀌면 영향을 재평가한다. 분야별 QA, 디자인·보안·안전 검토는 서로 대체하지 않는다.
