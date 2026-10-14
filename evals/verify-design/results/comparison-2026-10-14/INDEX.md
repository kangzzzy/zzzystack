# 자동화 장비 설계 스킬 비교

입력은 [장비 2대 + 로봇 1대](input/requirements.md)이며 [공통 실행·판정 기준](VERIFY.md)을 적용한다. 원본을 적용한 스킬 3개와 문서 기반 시험 어댑터 5개를 구분한다. 정식 스킬 분리·채택은 아직 하지 않는다.

| 후보 | 분야 | 유형 | 검증 기록 |
|---|---|---|---|
| Anthropic frontend-design | 화면/HMI | 원본 스킬 + 시험 래퍼 | [VERIFY](candidates/verify-design-anthropic/VERIFY.md) |
| UI UX Pro Max | 화면/HMI | 원본 템플릿 + 검색 도구 + 시험 래퍼 | [VERIFY](candidates/verify-design-ui-ux-pro-max/VERIFY.md) |
| LVGL | 화면/HMI | 문서·예제 기반 어댑터 | [VERIFY](candidates/verify-design-lvgl/VERIFY.md) |
| Awesome Copilot architecture-blueprint-generator | 시스템 구조 | 원본 스킬 + 시험 래퍼 | [VERIFY](candidates/verify-design-copilot/VERIFY.md) |
| arc42 | 시스템 구조 | 문서 템플릿 기반 어댑터 | [VERIFY](candidates/verify-design-arc42/VERIFY.md) |
| NASA F´ | 인터페이스·상세 설계 | 설계 문서 기반 어댑터 | [VERIFY](candidates/verify-design-fprime/VERIFY.md) |
| Nanopb | 데이터·자료구조 | 문서·예제 기반 어댑터 | [VERIFY](candidates/verify-design-nanopb/VERIFY.md) |
| Zephyr | 테스트 계획 | 시험 문서 기반 어댑터 | [VERIFY](candidates/verify-design-zephyr/VERIFY.md) |

원본 커밋·파일 해시·출처는 각 후보 SOURCE.json에 있다. 원본의 라이선스/저작권 파일을 함께 보존했다. arc42 템플릿과 그 각색 부분은 CC BY-SA 4.0이며 출처는 Gernot Starke·Peter Hruschka / arc42다. 다른 원본 라이선스는 Apache-2.0, MIT, Zlib 등 각 원본 고지를 따른다.

비교 한계: 1회 탐색 시험이며 전체 점수 순위를 만들지 않는다. 설계 문서/시뮬레이션이 실제 장비 성능·안전 검증이나 최종 Word/Excel/Figma 양식 검증을 의미하지 않는다. 개별 시험 내역과 미검증 사항은 각 VERIFY.md와 결과의 test-log.md를 따른다.

## 실행 결과 요약

검사 개수는 범위와 방법이 달라 후보 점수로 비교하지 않는다. 모든 후보의 정식 채택은 미결정이다.

| 후보 | 생성 결과 | 실제 검사·주요 문제 |
|---|---|---|
| anthropic | [화면 설계](candidates/verify-design-anthropic/results/run-01/design.md) | 모델 12/12; 저장 실패 후 진행·추측 상태·단계 우회 발견 |
| ui-ux-pro-max | [화면 설계](candidates/verify-design-ui-ux-pro-max/results/run-01/design.md) | 행동 6+정적 1 통과; 재시작 상태 손실·복구 경로 누락 발견 |
| lvgl | [화면 설계](candidates/verify-design-lvgl/results/run-01/design.md) | 모델 6/6; 오래된 복구 확인·ACK 후 timeout·재시작 손실 발견 |
| copilot | [시스템 설계](candidates/verify-design-copilot/results/run-01/architecture.md) | 구조 검사 통과; 현장 확인 필수 조건 불명확 |
| arc42 | [시스템 설계](candidates/verify-design-arc42/results/run-01/architecture.md) | 연결·해시·추적 검사 통과; 현장 확인 필수 조건 불명확 |
| fprime | [인터페이스·상세 설계](candidates/verify-design-fprime/results/run-01/interface.md) | 축약 모델/JSON 27개 통과; 독립 리뷰 중단 |
| nanopb | [데이터 설계](candidates/verify-design-nanopb/results/run-01/data-design.md) | 주 에이전트 실행 11개 통과; 현장 확인 조건 불명확·독립 리뷰 미완료 |
| zephyr | [테스트 계획](candidates/verify-design-zephyr/results/run-01/test-plan.md) | 12개 시나리오 계획·문서 대조; 행동 시험 미실행·독립 비교 제외 |

Fprime의 [상세 설계](candidates/verify-design-fprime/results/run-01/detail.md)도 함께 생성했다. 화면 3개 후보는 각 결과 폴더의 prototype.html에서 비교할 수 있다. 브라우저 연결 실패로 시각적 검증은 미완료다.

첫 6개 후보는 독립 작성 완료, Nanopb는 독립 작성 도중 중단되어 주 에이전트가 검사를 이어갔다. Zephyr는 주 에이전트 작성이다. 독립 리뷰는 앞의 5개만 완료했고 나머지는 에이전트 사용량 한도로 미완료다. 결과를 개선해 재시험한 것으로 오해하지 않도록 발견된 문제를 원본 산출물과 함께 보존한다.
