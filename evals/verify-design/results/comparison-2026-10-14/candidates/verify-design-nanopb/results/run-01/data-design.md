# 자동화 셀 데이터 설계 — 비교 시험 v1

가상 TCP/JSON을 유지하는 설계 제안이다. Protobuf·Nanopb·특정 DB 채택 결정은 없다.
입력 사실은 requirements.md의 REQ-01~16이며, 아래 추가 필드·범위·저장 전략은 모두 제안이다.
실제 프로토콜, 제어 주기, DONE 제한시간, 측정 종류/범위, 보존 기간은 미정이다.

## 1. 계약 경계와 크기 [REQ-04, 12, 16]

TCP 스트림은 메시지 경계가 없으므로 4-byte unsigned big-endian 길이 + UTF-8 JSON을 제안한다.
길이는 본문 byte 수이며 1~4096, 수신 버퍼도 상한을 두고 초과·불완전 프레임을 거부한다.
한 프레임은 JSON object 하나다. 중복 키, NaN/Infinity, 잘못된 UTF-8, 알 수 없는 필드는 거부한다.
파싱·전체 유효성 확인이 끝난 임시 객체만 상태에 반영한다. 일부 필드만 반영하지 않는다.
길이 제한은 UTF-8 byte 기준이며 문자열을 잘라 수용하지 않는다. 배열 개수와 전체 본문도 각각 검사한다.
정수는 bool과 구별하고 JSON 정수로 표현한다. 시간 순서 판단에는 장치 벽시계를 사용하지 않는다.

| 공통 필드 | 타입·길이·단위 | 검증·소유자 |
|---|---|---|
| schema_version | integer, 1 | v1만 수용, 미지원 버전 격리·명령 억제 |
| kind | enum | COMMAND / STATUS / MEASUREMENT / CONFIG / AUDIT |
| sender | enum | PC / D1 / D2 / R1; 연결과 발신자 일치 검사 |
| boot_id | ASCII ID 1~36 byte | 프로세스/제어기 부팅마다 새 값; 재사용 금지 |
| seq | integer 0~2^53−1 | 발신자·boot_id별 증가, 최대 도달 전 새 세션 협의 |
| sent_at | UTC RFC3339, 24 byte | YYYY-MM-DDTHH:MM:SS.sssZ; 진단용 |
| payload | kind별 object 하나 | 필수·허용 필드 목록으로 검증 |

ID 문자열은 `[A-Za-z0-9_-]`만 사용한다. 실제 ID 생성법·인증은 미정이다.
공통 필드는 저장 기록에도 포함한다. 저장 레코드에는 별도 store_version=1을 둔다.

## 2. 명령과 응답 [REQ-01, 03~07]

| 필드 | 타입·상한 | 의미·검증 |
|---|---|---|
| command_id / cycle_id | ASCII ID 1~36 byte | 명령 전역 유일 / 사이클 외래키 |
| target | D1 / D2 / R1 | 명령 수신 대상 |
| type | PROCESS / TRANSFER | PROCESS는 D1/D2, TRANSFER는 R1만 허용 |
| from / to | D1 / D2 | TRANSFER에만 필수이며 D1→D2 고정 |
| phase | REQUESTED / ACK / DONE / FAILED / UNKNOWN | 로컬 이력 또는 응답의 명령 단계 |
| result_code | ASCII 1~32 byte 또는 null | ACK는 완료 아님; DONE 결과와 분리 |

COMMAND의 payload는 요청 필드만 가진다. phase/result_code는 STATUS의 command_result에 기록한다.
command_result는 null 또는 {command_id, cycle_id, phase, result_code}; phase는 ACK/DONE/FAILED만 수신한다.
응답 sender=기존 target, cycle_id 일치 여부를 확인하고 기존 명령이 없으면 격리한다.
DONE 이후 늦은 ACK로 단계가 되돌아가지 않는다. UNKNOWN 해소는 신선한 조회·대조·복구 승인 필요다.
동일 command_id와 동일 의미 payload는 이전 결과를 반환하며 물리 작업을 다시 수행하지 않는다.
같은 ID·다른 내용은 충돌 오류다. 비교에는 transport seq/sent_at을 제외한 정규화 payload를 사용한다.
PC와 제어기 모두 중복 기록을 유지해야 하며 제어기 재부팅 후 보장 여부는 미정/필수 확인사항이다.
ACK 2초 초과 또는 이송 중 단절은 UNKNOWN, 점유 유지, 자동 이동 재전송 금지다.
REQ-01의 D1 PROCESS→R1 TRANSFER→D2 PROCESS는 각 DONE 확인 후에만 다음 단계로 전이한다.

## 3. 상태와 측정 [REQ-02, 05, 08, 10, 12, 13]

| 데이터 | 타입·길이·단위 | 유효성 |
|---|---|---|
| state | D1/D2: IDLE/PROCESSING/READY/FAULT; R1: IDLE/BUSY/FAULT | 제어기가 원본 |
| sensors.part_present / door_closed / safety_ok | boolean 또는 null | null은 모름, false와 구별; 필드 누락 거부 |
| command_result | object 또는 null | 위 응답 구조, 장치당 현재 결과 하나 |
| measurements | array 0~8 | 한 항목은 아래 measurement 필드 |
| name | ASCII ID 1~32 byte | 등록된 이름만 사용; 예제 temperature는 가상 |
| value / unit | finite number 또는 null / UTF-8 1~16 byte | 단위 변환 암묵 적용 금지 |
| measured_at | UTC RFC3339 24 byte | 측정 시각 필수, 수신 시각과 구별 |
| validity | VALID / INVALID / UNKNOWN | VALID는 유한 값 필수, 나머지는 value=null |

예제 temperature/degC의 0~100 범위는 검사 fixture 전용 가정이며 실제 설비 규격이 아니다.
OFFLINE은 PC 연결 상태에서 파생하여 표시하고 마지막 controller state를 덮어쓰지 않는다.
수신 monotonic 시각 기준 마지막 유효 heartbeat가 3초 이상 오래되면 OFFLINE; heartbeat 주기는 1초다.
중복·역순 메시지는 최신 상태나 freshness를 갱신하지 않는다. 가상 최대 상태 나이 3초를 제안한다.
같은 sender/boot_id에서 seq가 클 때만 최신 스냅샷 교체; seq 동일·내용 상이하면 오류다.
새 boot_id는 임의 승인하지 않는다. 연결 재협의 후 이전 boot를 폐기하고 복구 대조 전까지 배정을 막는다.
앱 재기동 후 저장된 수신 monotonic 값은 재사용하지 않고 모든 장치를 신선도 미확인으로 둔다.
시작/이송 판단은 제어 서비스가 신선도·점유·상태·센서·안전을 함께 확인한다. 알람 삭제로 정상화하지 않는다.

## 4. 설정·감사 [REQ-05, 09, 11, 13]

| 레코드 | 타입·제약 | 정책 |
|---|---|---|
| config.revision | integer 1~2^31−1 | 이전 revision 일치 조건으로 교체 |
| heartbeat_ms / offline_ms / ack_ms | integer ms; fixture는 1000/3000/2000 | 실제 성능 보장 아님 |
| done_timeout_ms / retention_days | positive integer 또는 null | 현재 null=미정, 0으로 대체 금지 |
| audit.event_id / actor_id | ASCII ID 1~36 / 1~64 byte | 이벤트 유일·인증된 행위자 |
| role | OPERATOR / MAINTENANCE / SYSTEM | 역할은 클라이언트 자기 선언을 신뢰하지 않음 |
| action / outcome | ASCII 1~32 / ALLOWED·DENIED·ERROR | START/PAUSE/RECOVERY_CONFIRM 등 |
| reason | UTF-8 0~256 byte | 비밀정보 제외, 거부 사유도 기록 |
| alarm_id / active / acknowledged | ID / bool / bool | 원인 해소와 확인·삭제 구분 |

작업자는 시작·일시정지, 유지보수만 복구 확정; 거부도 감사로 남긴다. 일시정지는 배정만 억제한다.
설정 변경은 검증된 새 revision과 감사 이벤트를 같은 원자적 단위로 저장한다.

## 5. 저장 일관성과 재기동 [REQ-03, 06, 07, 11]

논리 저장소: cycles(id, step, recovery_required), commands(id, cycle_id, payload, phase),
reservations(resource, command_id), snapshots(sender, boot_id, seq, payload), config, events, alarms.
commands.id UNIQUE, cycle_id/command_id 참조 무결성, reservations.resource UNIQUE를 요구한다.
R1·D1·D2 점유와 REQUESTED 명령, cycle 단계, 감사 이벤트를 한 transaction으로 저장 후 전송한다.
저장 실패 시 전송 0회·신규 배정 차단. ACK/DONE 적용과 cycle 전이·점유 해제·감사도 원자 처리한다.
저장 성공 후 전송 전/후 중단은 DB만으로 구별 불가하므로 재기동 시 미종결 명령을 UNKNOWN으로 둔다.
전송과 물리 동작을 로컬 transaction에 묶을 수 없으며 exactly-once 물리 실행을 주장하지 않는다.
동일 ID 중복 억제 기록은 이력 정리와 별개로 유지한다. 안전한 삭제 시점·보존 기간은 미정이다.
재기동 순서: 배정 잠금→저장 무결성 확인→각 제어기 새 상태·최근 명령 결과 조회→대조표 작성.
대조표는 저장 cycle/command/점유, controller boot/seq/result, 공작물·문·안전 입력, 불일치 사유를 포함한다.
모두 일치해도 자동 재개하지 않으며 유지보수 승인과 감사 저장 성공 후에만 복구 잠금 해제한다.
미응답·공작물 불일치·기록 손상은 UNKNOWN 유지, 현장 확인 요청; SW가 센서값을 수정하지 않는다.
저장 엔진은 미정이다. 예제 schema.sql의 SQLite는 Python 표준라이브러리 검사 수단일 뿐이다.
OS crash/power-loss 내구성, fsync 정책, 디스크 가득 참, 백업·복원은 별도 검증한다.

## 6. 원본 기여와 실행 범위 [REQ-15, 16]

자기 후보 upstream/docs/concepts.md: 명시 스키마, bounded string/array, framing, 실패 객체 미사용을 참고했다.
upstream/docs/reference.md: max_length/max_size/max_count와 UTF-8 검증 개념을 byte/개수 제한으로 옮겼다.
upstream/examples/simple/simple.proto: required int32 예제를 필수 필드·정수 타입 구분에 참고했다.
Nanopb의 C 문자열 null terminator 공간은 JSON byte 제한과 다르며 본 문서 수치는 직접 파생된 값이 아니다.
원본은 command 중복·DB 원자성·권한·전원 복구를 제공하지 않는다. 이 부분은 요구사항 기반 독자 제안이다.
examples.json은 다섯 종류의 작은 데이터 예시, schema.sql은 최소 저장 제약, check.py는 제한적 실행 증거다.
재현: 이 폴더에서 `python check.py`; 검사 범위·결과·문제·미검증은 test-log.md에 기록한다.
생성기/C 컴파일/네트워크/실장비/HIL/Word·Excel·Figma는 미실행이다. REQ-14 구성도는 본 data 범위 밖이다.
