const fs=require('node:fs'),vm=require('node:vm');
// Archived copy: resolve the same unchanged HTML beside this script.
const source=__dirname+'/prototype.html';
const ctx={};vm.createContext(ctx);vm.runInContext(fs.readFileSync(source,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1],ctx);
function transfer(){const c=ctx.createCell();for(const a of ['start','done','dispatch'])c.act(a);return c}
const out=[];
let c=transfer();for(const a of ['timeout','check','reconnect'])c.act(a);c.s.role='maintenance';out.push({test:'stale recovery before',checked:c.s.checked,fresh:c.s.d.R1.fresh,unknown:c.s.unknown,lock:c.s.lock});const recovered=c.act('recover');out.push({test:'stale recovery after',recovered,unknown:c.s.unknown,lock:c.s.lock,phase:c.s.phase,fresh:c.s.d.R1.fresh,reason:c.reason()});
c=transfer();c.act('ack');out.push({test:'ACK then timeout',beforeStatus:c.s.cmd.status,timeoutAccepted:c.act('timeout'),unknown:c.s.unknown,phase:c.s.phase});
c=transfer();c.act('loss');out.push({test:'before reload',unknown:c.s.unknown,lock:c.s.lock,cmd:c.s.cmd});c=ctx.createCell();c.act('start');out.push({test:'after reload and start',unknown:c.s.unknown,lock:c.s.lock,cmd:c.s.cmd});
console.log(JSON.stringify({runtime:process.version,scope:'Node VM model, no browser or hardware',results:out},null,2));
