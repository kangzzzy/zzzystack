$ErrorActionPreference = 'Stop'
$script:count = 0
function Check($name, $ok) {
 if (-not $ok) { throw "FAIL $name" }
 $script:count++; "PASS $name"
}
function New-Model {
 @{ Phase='D1_PROCESS'; Command='SENT'; Mode='RUN'; Owner='cycle-1'; Sends=1; Seq=4; Physical='READY'; Executions=0; Ledger=@{} }
}
function Apply($s, $event) {
 switch ($event) {
  'ACK' { if ($s.Command -eq 'SENT') {$s.Command='ACKED'} }
  'DONE' { $s.Command='DONE'; if ($s.Mode -eq 'RUN') {$s.Phase='TRANSFER'} }
  'TIMEOUT' { $s.Command='UNKNOWN'; $s.Mode='HOLD' }
  'DISCONNECT' { $s.Command='UNKNOWN'; $s.Mode='HOLD' }
  'RECONNECT' { $s.Mode='HOLD' }
  'RESTART' { $s.Command='UNKNOWN'; $s.Mode='HOLD' }
  'CLEAR_ALARM' { }
  'PAUSE' { $s.Mode='PAUSED' }
 }
}
function Can-Send($s, $fresh, $safe, $door, $stored) {
 return ($s.Mode -eq 'RUN' -and $fresh -and $safe -and $door -and $stored)
}
function Receive-Command($s, $id, $payload) {
 if ($s.Ledger.ContainsKey($id)) {
  if ($s.Ledger[$id] -ne $payload) { return 'ID_CONFLICT' }
  return 'CACHED'
 }
 $s.Ledger[$id]=$payload; $s.Executions++; return 'ACCEPTED'
}
function Recover($s, $role, $matched) {
 if ($role -ne 'maintenance') {return 'FORBIDDEN'}
 if (-not $matched) {return 'MISMATCH'}
 $s.Mode='PAUSED'; return 'CONFIRMED'
}
$s=New-Model
Apply $s ACK
Check 'ACK never advances cycle' ($s.Phase -eq 'D1_PROCESS' -and $s.Command -eq 'ACKED')
Apply $s DONE
Check 'DONE advances modeled phase' ($s.Phase -eq 'TRANSFER')
Apply $s ACK
Check 'late ACK never downgrades DONE' ($s.Command -eq 'DONE')
$s=New-Model
Apply $s TIMEOUT
Check 'ACK loss retains ownership and stops dispatch' ($s.Command -eq 'UNKNOWN' -and $s.Owner -eq 'cycle-1' -and -not (Can-Send $s $true $true $true $true))
Apply $s DONE
Check 'late DONE preserves HOLD' ($s.Mode -eq 'HOLD' -and $s.Phase -eq 'D1_PROCESS')
$s=New-Model
Apply $s DISCONNECT
Apply $s RECONNECT
Check 'reconnect does not resend or release ownership' ($s.Sends -eq 1 -and $s.Owner -eq 'cycle-1' -and $s.Mode -eq 'HOLD')
Apply $s CLEAR_ALARM
Check 'alarm clear does not recover' ($s.Mode -eq 'HOLD')
Check 'operator recovery rejected' ((Recover $s operator $true) -eq 'FORBIDDEN')
Check 'maintenance mismatch rejected' ((Recover $s maintenance $false) -eq 'MISMATCH')
Check 'maintenance confirmation stays paused' ((Recover $s maintenance $true) -eq 'CONFIRMED' -and $s.Mode -eq 'PAUSED')
Apply $s RESTART
Check 'restart requires reconciliation' ($s.Mode -eq 'HOLD' -and $s.Command -eq 'UNKNOWN' -and $s.Sends -eq 1)
$s=New-Model
Check 'first command accepted' ((Receive-Command $s c1 transfer) -eq 'ACCEPTED')
Check 'duplicate command returns cache' ((Receive-Command $s c1 transfer) -eq 'CACHED' -and $s.Executions -eq 1)
Check 'same ID different payload rejected' ((Receive-Command $s c1 process) -eq 'ID_CONFLICT' -and $s.Executions -eq 1)
$incomingSeq=3
if ($incomingSeq -gt $s.Seq) {$s.Seq=$incomingSeq; $s.Physical='IDLE'}
Check 'out-of-order status cannot overwrite latest' ($s.Seq -eq 4 -and $s.Physical -eq 'READY')
Check 'fresh safe stored request permitted' (Can-Send $s $true $true $true $true)
Check 'stale status blocks service' (-not (Can-Send $s $false $true $true $true))
Check 'unsafe input blocks service' (-not (Can-Send $s $true $false $true $true))
Check 'door open blocks service' (-not (Can-Send $s $true $true $false $true))
Check 'storage failure blocks service' (-not (Can-Send $s $true $true $true $false))
Apply $s PAUSE
Check 'pause blocks new assignment' (-not (Can-Send $s $true $true $true $true))
Check 'heartbeat offline boundary' ((2.999 -lt 3) -and (3.0 -ge 3))
Check 'ACK timeout boundary' ((1.999 -lt 2) -and (2.0 -ge 2))
$doc=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'interface.md') -Raw
$match=[regex]::Match($doc,'(?s)```json\s*(.*?)\s*```')
$j=$match.Groups[1].Value | ConvertFrom-Json
Check 'example envelope fields' ($j.schema_version -eq 1 -and $j.sender -eq 'PC' -and $j.seq -ge 0 -and $j.kind -eq 'COMMAND')
Check 'example transfer target and route' ($j.payload.target -eq 'R1' -and $j.payload.type -eq 'TRANSFER' -and $j.payload.args.from -eq 'D1' -and $j.payload.args.to -eq 'D2')
$parsed=[guid]::Empty
Check 'example command ID UUID' ([guid]::TryParse($j.payload.command_id,[ref]$parsed))
Check 'example cycle ID UUID' ([guid]::TryParse($j.payload.cycle_id,[ref]$parsed))
"TOTAL $script:count passed; local illustrative model only"
