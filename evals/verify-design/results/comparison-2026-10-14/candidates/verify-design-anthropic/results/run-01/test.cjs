const fs=require('fs'),vm=require('vm'),assert=require('assert'),crypto=require('crypto');
const html=fs.readFileSync(__dirname+'/prototype.html','utf8');
const code=html.match(/<script>([\s\S]*?)<\/script>/)[1];
function env(){const elements={},data={};const context=vm.createContext({crypto,document:{getElementById(id){return elements[id]??=( {checked:false,value:id==='role'?'operator':'',textContent:'',innerHTML:'',disabled:false})}},localStorage:{setItem(k,v){data[k]=v},getItem(k){return data[k]||null}}});vm.runInContext(code,context);return x=>vm.runInContext(x,context)}
let passed=0;const results=[];function test(name,fn){try{fn(env());passed++;results.push('PASS '+name)}catch(e){results.push('FAIL '+name+': '+e.message)}}
const transfer="act('start');act('ack');act('done');act('next');act('ack');";
test('정상 사이클 / ACK와 DONE 구분',r=>{r("act('start');act('ack')");assert.equal(r('s.phase'),'D1 가공');r("act('done');act('next');act('ack');act('done');act('next');act('ack');act('done')");assert.equal(r('s.phase'),'완료');assert.equal(r('s.commands.length'),3);assert.equal(r('new Set(s.commands.map(c=>c.id)).size'),3);assert(r('s.commands.every(c=>c.ack&&c.done)'))});
test('이송 두절 / 3초 OFFLINE / 점유 보존',r=>{r(transfer+"act('disconnect');act('tick');act('tick');act('tick')");assert(r('s.blocked&&s.occupied'));assert.equal(r('s.devices.R1.state'),'OFFLINE');const n=r('s.commands.length');r("act('next')");assert.equal(r('s.commands.length'),n)});
test('재접속 무자동재개 / 유지보수 복구',r=>{r(transfer+"act('disconnect');act('reconnect')");assert(r('s.blocked'));r("act('query');$('field').checked=true;act('recover')");assert(r('s.blocked'));r("$('role').value='maintenance';act('recover')");assert(r('s.blocked'));r("act('done');act('query');act('recover')");assert(!r('s.blocked'));assert.equal(r('s.commands.length'),2)});
test('ACK 유실 2초 / 재전송 없음',r=>{r("act('start');act('tick');act('tick')");assert(r('s.blocked'));assert.equal(r('s.commands.length'),1)});
test('중복 수신 실행 횟수 유지',r=>{r("act('start');act('duplicate');act('duplicate')");assert.equal(r('current().executions'),1);assert.equal(r('s.commands.length'),1)});
test('역순 주입 최신 상태 불변',r=>{const before=r('JSON.stringify(s.devices.D1)');r("act('reverse')");assert.equal(r('JSON.stringify(s.devices.D1)'),before)});
test('앱 재기동 차단 / 명령 보존',r=>{r("act('start');act('restart')");assert(r('s.blocked'));assert.equal(r('s.commands.length'),1)});
test('문 열림 및 안전 입력 서비스 차단',r=>{r("act('door');act('start')");assert.equal(r('s.commands.length'),0);r("act('door');act('safety');act('start')");assert.equal(r('s.commands.length'),0)});
test('저장 실패 신규 명령 없음',r=>{r("$('saveFail').checked=true;act('start')");assert.equal(r('s.commands.length'),0);assert(r("notice.includes('저장 실패')"))});
test('알람 확인만으로 정상화 금지',r=>{r("act('safety');act('clear')");assert(r('s.blocked&&!s.safe'))});
test('일시정지 신규 배정 차단',r=>{r("act('pause');act('start')");assert.equal(r('s.commands.length'),0)});
test('이송 센서 조건 서비스 검사',r=>{r("act('start');act('done');s.devices.D2.part=true;act('next')");assert.equal(r('s.commands.length'),1)});
const report=results.join('\n')+'\n'+passed+'/'+results.length+' passed\n';fs.writeFileSync(__dirname+'/test-results.txt',report);console.log(report);if(passed!==results.length)process.exitCode=1;
