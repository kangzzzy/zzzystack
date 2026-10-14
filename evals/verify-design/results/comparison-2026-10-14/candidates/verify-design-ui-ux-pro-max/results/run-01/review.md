# UI UX Pro Max 후보 독립 검토

- 검토자: /root/review_evals_move (작성자와 별도 실행)
- 대상: `.test-work/design-comparison/verify-design-ui-ux-pro-max`의 requirements.md, design.md, prototype.html, verify.cjs, test-log.md
- 날짜: 2026-10-14
- 범위: 이 후보의 입력·산출물만 근거로 하는 가상 프로토타입 검토. 타 후보와 비교하거나 원본 스킬 성능의 인과적 결론을 내리지 않는다.
- 판정: 요구사항 미충족 3건. 최소 UI 탐색이라는 문서의 경계는 인정하며, 전체 구현 완료의 은폐·과장으로 판정하지 않는다.

## 1. 재기동하면 결과 불명·점유와 명령 식별자가 소실됨

REQ-04·07·11. prototype.html의 initial()/state 초기화는 저장 복원 없이 unknown=false, occupied=false, serial=0으로 시작한다.

재현: start → next 3회 → drop으로 R1 이송 요청 뒤 통신 두절 상태를 만든다. 새 VM에 같은 HTML 스크립트를 다시 실행하여 페이지 재로드를 모사하고 start를 누른다.

관측: 이전 상태는 unknown=true, occupied=true, R1/SIM-2. 재로드 후 유지보수 대조 없이 D1/SIM-1/CYCLE-1 요청이 가능하다. 과거 명령 ID와 cycle ID도 재사용된다. 자동으로 물리 명령을 발행한 것은 아니지만 복구 확인 없이 신규 요청을 허용한다.

설계·로그에 영속성/재기동 미구현이 명시되어 있으므로 알려진 요구사항 공백이다. 이 상태에서 재기동 요구가 검증됐다고 간주할 수 없다.

## 2. D2 ACK timeout에도 복구 경로가 없음

REQ-06·07·15. query 조건과 UI 활성화는 phase='R1 이송'만 허용한다.

재현: start → next 6회(D2 REQUEST) → acklost → query → 현장 확인 → 유지보수 역할 → recover.

관측: phase='D2 가공', target='D2', unknown=true, queried=false이며 query/recover 모두 비활성. 명령 상태 조회로 정상 복구할 수 없고 데모 초기화만 남는다. 로그는 D1 ACK 유실 복구 미구현을 명시했지만 같은 공백이 D2에도 존재한다. 기존 ACK timeout 시험은 차단·재전송 부재까지만 검사한다.

## 3. 안전 입력 변경 뒤 기존 조회·현장 확인을 재사용함

REQ-07·13. door/safety 전이는 queried/checked를 무효화하지 않는다.

재현: start → next 3회 → drop → reconnect → query → 현장 확인 체크 → 유지보수 선택 → safety(비정상) → safety(정상) → recover.

관측: 재조회·재확인 없이 unknown=false, phase='D2 배정 대기'로 복구 확정된다. 안전 입력 변경 이전의 확인값을 현재 상태 대조 증거로 재사용한다. 안전 입력이 바뀌면 확인을 무효화하거나 확인 시각/상태 버전과 연계하는 것이 필요하다. 복구 후 paused=true는 유지되므로 자동 명령 재개라고 표현하지 않는다.

## 실제 검증과 한계

- 원본 verify.cjs를 수정 없이 실행: 7개 PASS 재현.
- 추가 시험은 원본 HTML inline JS를 Node v24.14.1 VM/DOM stub에서 직접 실행. 원본 파일과 결과 파일을 쓰지 않음.
- 재기동은 새 JS 실행 맥락으로 모사했으며 실제 브라우저 새로고침/시각/접근성 검증은 수행하지 않음.
- 문서가 중복·역순·영속성·재기동·저장 실패 및 실제 브라우저 검증을 미실행으로 명시하므로 7개 PASS를 전체 산업 제어 검증으로 해석하지 않음.
- 네트워크, 설치, 실장비, 재위임 없음.
