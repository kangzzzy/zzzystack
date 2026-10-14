# 상세 설계 초안 — 가상 셀 v1

## 1. 설계 상태
- 확인된 입력은 requirements.md REQ-01~16이며 신규 코드베이스는 없다.
- 아래 모듈, 저장 트랜잭션, 복구 프로세스는 설계 제안이다.
- 실제 모터 제어·로봇 경로·안전 정지 성능과 Fprime 도입은 결정하지 않는다.
- 인터페이스의 메시지 계약을 참조하며 원본과 충돌할 때 입력 요구를 우선한다.

## 2. 모듈 책임과 호출 경계
| 모듈 | 입력 → 출력 | 책임/금지 |
|---|---|---|
| HMI Presenter | snapshot/events → 화면, 사용자 → 요청 | 상태·연결·센서·단계·알람·요청/ACK/DONE 텍스트; 물리 상태 변경 금지 |
| Command Service | 인증 요청 → 검증 결과/명령 | 역할·pause·신선도·안전·점유 검사 |
| Cycle Coordinator | 완료 증거 → 다음 단계 후보 | 순서·cycle 소유권; ACK로 다음 단계 금지 |
| Device Adapter | send ↔ TCP bytes | 프레임/버퍼 수명/역압; 이동 자동 재전송 금지 |
| State Projector | STATE → 원본 스냅숏/연결 overlay | boot_id/seq/유효성 검사; 센서 추측 금지 |
| Health Monitor | 단조 시각/heartbeat → OFFLINE | >=3초 판정; SW 감시이며 HW 안전 아님 |
| Command Journal | command/events → durable records | 유일 ID·원자 기록·중복 결과 |
| Recovery Service | 조회/현장 증거/역할 → 복구 결정 | 자동 재개 금지, 승인 감사 |
| Alarm/Audit | 사건 → 영속 이벤트/HMI | acknowledge와 원인 해소를 구분 |

## 3. 저장과 실행 순서
1. 시작 요청에서 작업자/유지보수 역할을 검증한다. 그 외 역할은 거절한다.
2. 단일 coordinator 실행 구간에서 관련 최신 상태와 안전 입력을 검사한다.
3. 트랜잭션으로 cycle, command(PREPARED), 자원 점유, 감사 outbox를 함께 기록한다.
4. commit 성공 후 dispatch 의도를 SENT로 영속화하고 어댑터에 1회 전달한다.
5. SENT 기록 뒤 송신 전 죽어도 재기동은 UNKNOWN으로 조회하며 자동 송신하지 않는다.
6. 송신 이후 ACK/DONE은 별도 트랜잭션으로 원본 이벤트와 투영 상태를 함께 저장한다.
7. 저장 실패 시 새로운 송신을 억제한다. 이미 실행 중인 명령은 UNKNOWN/HOLD로 취급한다.
8. 저장이 회복될 때까지 메모리 장애 표시는 유지하며 감사 영속 성공을 주장하지 않는다.
- DB 종류는 미정; 원자 commit·유일 제약·충돌 검출이 필요하다. REQ-11.
- 컨트롤러의 중복 등록/실행도 원자적이어야 하며 이는 아직 구현·검증되지 않았다.

## 4. 상태 모델: 장비·명령·사이클은 분리
| 축 | 상태 | 전이 기준 |
|---|---|---|
| 연결 | CONNECTING/ONLINE/OFFLINE/RECONCILING | 유효 heartbeat/3초/boot 변경 |
| 명령 | PREPARED/SENT/ACKED/DONE/REJECTED/UNKNOWN | 저장/전송/ACK/완료/거절/불명 |
| 사이클 | IDLE/D1_PROCESS/TRANSFER/D2_PROCESS/COMPLETE | 실제 완료 및 상태 대조 |
| 실행 허용 | RUN/PAUSED/HOLD/RECOVERY_REQUIRED | 사용자 pause/불명/불일치 |
- 장비 상태 열거형은 interface.md와 REQ-02를 따른다.
- 초기/재시작 실행 허용은 HOLD다. 초기 현황 확인과 승인 전 자동 시작하지 않는다.
- SENT→ACKED는 일치하는 수락 ACK, SENT/ACKED→DONE은 일치하는 DONE 증거다.
- SENT→UNKNOWN은 ACK timeout, 연결 단절/프로세스 재시작은 미완료 명령→UNKNOWN이다.
- UNKNOWN→DONE 기록은 가능하지만 실행 허용 HOLD는 유지한다.
- DONE 뒤 ACK나 중복 DONE은 무효 전이; 동일 결과는 idempotent, 상충 결과는 복구 알람.
- PREPARED 중 송신되지 않았음이 확실한 취소만 취소 처리; 모호하면 UNKNOWN이다.

## 5. 정상 사이클 상세
1. IDLE에서 D1/D2/R1 연결·센서 유효·안전 정상, D1 공작물 존재를 확인한다.
2. D1 PROCESS를 요청하고 DONE과 D1 READY/공작물 존재를 대조한다.
3. D1 READY+존재, D2 IDLE+비어 있음, R1 IDLE, 관련 문 닫힘을 재검사한다.
4. D1/D2/R1을 한 cycle_id로 점유한 뒤 R1 TRANSFER를 요청한다.
5. R1 DONE, D1 비어 있음, D2 공작물 있음, R1 IDLE의 신선한 상태를 대조한다.
6. 대조 성공을 영속화한 후 이송 점유를 정리하고 D2 PROCESS를 요청한다.
7. D2 DONE 및 제어기 완료 상태를 대조하고 사이클 COMPLETE를 저장한다.
- D2 완료 시 실제 상태는 계약 합의 미정; 제안은 READY이며 공급사와 확인 필요하다.
- 다른 사이클 병렬 파이프라인은 1차 범위 밖; 활성 사이클 하나로 제한한다.
- ACK만 수신했을 때 어느 단계도 다음 단계로 진행하지 않는다. REQ-01,03,04.

## 6. 동시성과 소유권 불변식
- 단일 coordinator 큐만 사이클/점유를 변경하며 I/O 콜백은 불변 이벤트를 전달한다.
- 송신 직전 상태 revision을 다시 검사한다. 변경되면 배정을 취소/보류한다.
- 점유와 명령 기록은 동일 트랜잭션; 경쟁 요청 둘 중 하나만 성공한다.
- 안전 이벤트와 시작이 경쟁하면 최신 입력으로 서비스가 재검사한다.
- 검사 직후 물리 변화까지 PC가 보장할 수 없으므로 제어기 인터록/HW 안전 검증이 필요하다.
- UI 버튼 비활성만으로 억제하지 않는다. 직접 API 호출에도 같은 검사 적용. REQ-10.
- 반환한 프레임 버퍼는 읽지 않고, txStatus가 반환보다 먼저 오면 프로토콜 오류로 격리한다.
- callback 지연/큐 과부하도 상태 신선도를 연장하지 않는다.

## 7. 복구 시퀀스와 역할
1. ACK 유실/이송 중 단절에서 UNKNOWN과 HOLD를 저장하고 점유를 유지한다.
2. 재접속은 새 세션으로 QUERY만 허용하고 cycle/command 기록을 조회한다.
3. 저장 기록·컨트롤러 완료 기록·센서 위치를 대조한다. 제어기 UNKNOWN이면 현장 확인 필요다.
4. 유지보수 사용자가 원인 해소·현장 증거·대조 결과를 확인하고 복구를 확정한다.
5. 승인 트랜잭션은 사용자/시각/사유/증거 revision/선택 단계를 저장한다.
6. 승인 후 상태 revision이 달라졌으면 다시 대조한다. 오래된 승인은 실행 권한이 아니다.
7. 복구는 PAUSED로 끝낸다. 별도 시작 요청과 모든 guard 통과 후 후속 미실행 단계로 진행한다.
- 이미 완료한 이송을 같은 ID 또는 새 ID로 다시 발행하지 않는다.
- 모순/원인 미해소/증거 부족이면 RECOVERY_REQUIRED를 유지하고 점유를 해제하지 않는다.
- 작업자의 복구 확정은 FORBIDDEN과 감사 이벤트; 시작·일시정지만 허용한다. REQ-09.
- pause는 신규 배정 억제이며 진행 중 물리 동작 정지 명령이 아니다.
- 알람 acknowledge/삭제는 정상 복귀 또는 점유 해제의 근거가 아니다. REQ-13.

## 8. 예외 처리
| 예외 | 제어 동작 | 관측 |
|---|---|---|
| 문 열림/안전 비정상 | 신규 송신 금지, 진행 명령 대조 필요 | 원인별 텍스트/알람 |
| heartbeat 정상·STATE stale | 시작/이송 금지 | 상태 오래됨 표시 |
| 역순/중복 STATE | 현재 투영 유지 | discarded_seq 감사 |
| ID 충돌/상충 DONE | 실행 거절/복구 필요 | conflict 이벤트 |
| 컨트롤러 boot 변경 | 순번 세대 격리, 대조 | boot_changed 알람 |
| 잘못된 프레임/큐 초과 | 폐기/거절, 새 작업 보류 | parse_error/backpressure |
| 저장 실패/앱 재기동 | HOLD/조회, 자동 송신 없음 | storage_fault/recovery_pending |

## 9. 검증과 요구 추적
| 요구 | 설계 위치 | 검증 방식 |
|---|---|---|
| 01~04 | 정상 순서·명령 상태·점유 | 로컬 모델의 ACK/DONE/중복/점유 assertions |
| 05~07 | 시간·UNKNOWN·복구 | 모델 경계값/재접속/재시작; 실제 시간 성능 미검증 |
| 08~10 | HMI 계약·역할·서비스 guard | 모델 권한/안전/stale; 실제 화면/API 미구현 |
| 11~13 | 원자 저장·투영·알람 | 모델 저장 실패/역순; 디스크 crash 원자성 미검증 |
| 14~16 | 인터페이스 도식·예외·시험 기록 | 문서 검토와 test-log.md |
- 실행 가능한 검사: verify-model.ps1. 검사 결과: model-results.txt.
- 원본의 포트/수명/역압 명시와 Health의 요구-검사 추적 방식을 적용했다.
- 원본 Health의 FATAL/watchdog/감시 비활성 기능은 장비 안전 요구로 채택하지 않았다.
- 로컬 모델은 이 설계의 일부 불변식을 예시로 검사하며 구현 적합성/실통신/실장비를 증명하지 않는다.
