# LVGL 문서 어댑터 후보 독립 검토

검토자: /root/review_evals_move. 날짜: 2026-10-14.

대상은 `.test-work/design-comparison/verify-design-lvgl/`의 requirements.md, design.md, prototype.html, check.cjs, test-log.md다. 이 후보의 입력과 산출물만 대조했으며 다른 후보와 비교하거나 원본 스킬 성능의 인과적 결론을 내리지 않았다. 원본 파일은 수정하지 않았다.

판정: 핵심 요구 공백 및 상태 전이 결함 3건. 원본 검사의 6 PASS는 재현했으나 전체 요구 충족 판정은 아니다.

## 1. 재접속으로 상태가 미확인이 된 뒤에도 이전 확인으로 복구 확정

- 근거: REQ-07·13, prototype.html의 reconnect/recover 분기.
- 재현: start → done → dispatch → timeout → check → reconnect → 유지보수 역할 → recover.
- 관측: reconnect가 R1.fresh=false로 바꾸지만 checked=true는 남는다. recover는 최신성/연결을 검사하지 않아 true를 반환하고 unknown=false, lock=false, phase=D2_READY로 전환한다. 동시에 reason()은 '연결 끊김 또는 오래된 상태'다.
- 영향: 상태 미확인인 장비를 포함한 복구를 확정하고 점유를 해제한다. 다음 dispatch는 freshness 검사로 차단되므로 자동 명령 재개로 표현하지 않는다. 재접속 시 확인을 무효화하고 복구 확정에 최신 연결 상태 검사가 필요하다.
- 공개 여부: 문서는 재접속 후 상태 대조가 필요하다고 설명하지만 이 확인 재사용 결함은 명시하지 않는다.

## 2. ACK를 이미 수신한 명령도 ACK timeout으로 결과 불명 처리

- 근거: REQ-04·05·06, prototype.html의 timeout 조건.
- 재현: start → done → dispatch → ack → timeout.
- 관측: status=ACK인데 timeout이 true를 반환하고 unknown=true가 된다. timeout은 DONE이 아닌 모든 명령을 허용하며, ACK 대기 여부를 확인하지 않는다. 화면 timeout 버튼도 해당 상태에서 막지 않는다.
- 영향: 수신 확인이 끝난 정상 진행 명령을 ACK 유실로 오판한다. REQUEST 상태에서만 ACK 대기 만료를 적용해야 하며 미정인 DONE 제한시간과 혼동하면 안 된다.
- 공개 여부: 실제 타이머 미구현은 공개됐지만 이 주입 조건 오류는 별개다. 기존 테스트는 REQUEST 상태 timeout만 확인한다.

## 3. 재기동 시 결과 불명·점유를 잃고 과거 ID로 신규 시작 가능

- 근거: REQ-04·07·11, prototype.html의 createCell 초기화 및 메모리 전용 이력.
- 재현: start → done → dispatch → loss 후 createCell()을 새로 실행해 페이지 재로드의 모델 재생성을 모사한다. start 호출.
- 관측: 재생성 전 unknown=true/lock=true/R1 sim-1-2였으나 새 모델은 복구 확인 없이 D1 sim-1-1/cycle-1을 요청한다. 이전 사이클의 명령 ID도 재사용된다.
- 영향: 미확정 이송을 대조할 기록 없이 새 사이클을 시작할 수 있다. 자동으로 요청을 발행하는 것은 아니지만 유지보수 복구 게이트가 없다.
- 공개 여부: design.md와 test-log.md가 재기동·영속성·세션 ID 재사용을 명시한다. 숨겨진 과장이 아니라 이미 공개된 핵심 요구사항 미구현이다.

## 실행 증거와 한계

- 원본 `check.cjs` 실행 결과 6 PASS: [original-check-output.txt](original-check-output.txt).
- 추가 재현: [repro.cjs](repro.cjs), [repro-output.json](repro-output.json).
- 실행 명령: 저장소 루트에서 `node .test-work/review-lvgl/repro.cjs`.
- Node v24.14.1 VM으로 원본 inline JS 모델을 실행했다. 브라우저, LVGL 런타임, 통신, 실장비, 시각·접근성 검증은 수행하지 않았다. 재기동은 모델 재생성으로 모사했다.
- 원본 로그는 모델 시험과 미검증 범위를 구분하며 REQ-15 전체 통과를 주장하지 않는다. 6 PASS를 전체 산업 제어 검증으로 과장했다고 판정하지 않는다.
- 네트워크·설치·재위임 없음. 검토 파일만 `.test-work/review-lvgl/`에 저장했다.
