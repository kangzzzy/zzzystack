# 탐색 시험 기록 — verify-design-fprime

- 수행일: 2026-10-14. 독립 후보 1회 탐색, 다른 후보 산출물 미열람.
- 입력: 동일 폴더 requirements.md, 지정 후보 SKILL.md, 연결 원본 3개, 공통 tasks.json.
- 산출물: interface.md, detail.md, verify-model.ps1, model-results.txt, 본 문서.
- 원본 파일 변경·설치·네트워크·실장비·하위 에이전트 사용 없음.

## 실행 검사
재현 명령(해당 작업 폴더에서 PowerShell):
```powershell
& ./verify-model.ps1
```
실제 실행 결과: exit code 0, 27 assertions PASS. 원시 출력은 model-results.txt.
모델은 해시테이블 상태와 순수 함수로 작성했으며 실제 제어 서비스가 아니다.

| 시험 | 입력 | 기대·관측 | 실행 결과 |
|---|---|---|---|
| ACK/DONE 구분 | ACK 후 DONE/늦은 ACK | ACK는 단계 유지, DONE 후 downgrade 없음 | PASS |
| ACK 유실 | TIMEOUT, 이후 DONE | UNKNOWN/HOLD, 점유 유지, 자동 진행 없음 | PASS |
| 이송 중 끊김/재접속 | DISCONNECT→RECONNECT | sends 불변, 점유 유지, HOLD | PASS |
| 명령 중복/ID 충돌 | 같은 ID 같은/다른 payload | 실행 횟수 1, CACHED/ID_CONFLICT | PASS |
| 역순 상태 | 현재 seq=4에 seq=3 | 현재 READY 유지 | PASS |
| 앱 재기동 | RESTART | UNKNOWN/HOLD, 송신 횟수 불변 | PASS |
| 문 열림/안전 입력 | door/safe=false | service guard=false | PASS |
| 권한 없는 복구 | operator | FORBIDDEN, 유지보수도 불일치면 거절 | PASS |
| 복구 확정 | maintenance, matched=true | PAUSED로 종료 | PASS |
| 저장 실패 | stored=false | 새 송신 guard=false | PASS |
| 상태 stale/일시정지 | fresh=false/PAUSE | 새 배정 금지 | PASS |
| 시간 경계 | 2.999/3 및 1.999/2 | OFFLINE/ACK timeout 경계 비교 | PASS |
| JSON 예제 | interface.md JSON 블록 실제 파싱 | 버전·대상·경로·UUID 확인 | PASS |

## 문서 검토 근거
- REQ-01~04: 단계 순서, 제어기 원본, 점유 및 ID/ACK/DONE 계약 명시.
- REQ-05~07: 가상 시간 상수, UNKNOWN, 재접속·재시작 대조와 수동 복구 명시.
- REQ-08~10: HMI의 텍스트 표시, 역할, 서버 guard, stale/안전 입력 억제 명시.
- REQ-11~13: 저장 트랜잭션·중복·역순·알람 삭제의 비복구 의미 명시.
- REQ-14~16: 경계 도식, 예외별 기대 관측, 입력/제안/미정 및 실제 HW 한계 명시.
- 포트 방향/버퍼 반환/전송 준비를 명시하는 원본 방식을 적용했다.
- Health 문서의 요구-설계-시나리오-시험 추적 구조를 적용했다.
- 원본의 실패 데이터 재전송/복구 시 큐 재개는 REQ-06/07과 충돌해 제외했다.

## 문제와 한계
- 관찰된 검사 실패 없음. 이는 모델 assertions와 JSON 예제의 제한된 결과다.
- 정상 사이클 실행 검사는 D1_DONE→TRANSFER 전이만 축약 검증했다. 전체 D1→R1→D2 흐름은 문서 검토다.
- 모델 DONE은 물리 센서 대조를 구현하지 않는다. 실제 설계는 DONE 뒤 신선한 상태 대조가 필요하다.
- sends 값 검사는 자동 송신이 없는 모델 상태를 확인한다. 실제 TCP 송신 횟수 측정이 아니다.
- 시간 검사는 숫자 경계식이며 타이머 스케줄링/지터/실시간 성능을 검사하지 않는다.
- 저장 실패 검사는 guard 분기다. DB 트랜잭션, 중단 주입, 디스크 원자성은 미검증이다.
- 컨트롤러 영속 중복 방지, 새 boot 세대 인증, TCP 분할/병합, 역압, 버퍼 수명은 문서만 정의했다.
- 경쟁 조건, 제어기 인터록, 물리 위치, HW 비상정지, 안전 정지 시간, 실제 HMI/API는 미검증이다.
- 실제 장비 프로토콜/주소/레지스터/DONE 제한 시간/보존 기간/인증은 미정이다.
- Fprime나 특정 DB/프로토콜 채택을 확정하지 않는다. Word/Excel/Figma 출력은 범위 밖이다.
