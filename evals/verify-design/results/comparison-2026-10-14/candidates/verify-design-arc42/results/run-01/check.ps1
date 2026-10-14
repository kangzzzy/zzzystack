$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
# Archived copy: the candidate is two levels above results/run-01.
$candidate = [IO.Path]::GetFullPath((Join-Path $root '../..'))
$doc = Get-Content -LiteralPath (Join-Path $root 'architecture.md') -Raw
$lines = @(Get-Content -LiteralPath (Join-Path $root 'architecture.md')).Count
if ($lines -gt 150) { throw "Line limit exceeded: $lines" }
"PASS document line limit: $lines <= 150"
$reqHash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $root 'requirements.md')).Hash
if ($reqHash -ne '64A171E937482E2F45273C791766034932A8E61FB062140B6B796A70FDACB8D3') { throw 'Input changed' }
'PASS requirements hash unchanged from initial read'
$manifest = Get-Content -LiteralPath (Join-Path $candidate 'SOURCE.json') -Raw | ConvertFrom-Json
foreach ($entry in $manifest.files) {
  $hash = (Get-FileHash -Algorithm SHA256 -LiteralPath (Join-Path $candidate $entry.local)).Hash
  if ($hash -ne $entry.sha256) { throw "Upstream mismatch: $($entry.local)" }
}
"PASS upstream hashes: $($manifest.files.Count) manifest entries"
foreach ($file in @((Join-Path $root 'architecture.md'), (Join-Path $candidate 'SKILL.md'))) {
  $body = Get-Content -LiteralPath $file -Raw
  foreach ($link in [regex]::Matches($body, '\]\(([^)]+)\)')) {
    $target = $link.Groups[1].Value
    if ($target -match '^https?://') { continue }
    if (-not (Test-Path -LiteralPath (Join-Path (Split-Path $file) $target))) { throw "Missing local link: $target" }
  }
}
'PASS local links in architecture and candidate skill resolve'
$fences = [regex]::Matches($doc, '(?m)^```').Count
if ($fences -ne 2 -or -not $doc.Contains('```mermaid')) { throw 'Expected one closed Mermaid block' }
'PASS one closed Mermaid block (syntax/render not tested)'
$table = ($doc -split '## 6\.')[1] -split '## 7\.' | Select-Object -First 1
$ids = @([regex]::Matches($table, 'REQ-\d{2}') | ForEach-Object { $_.Value } | Sort-Object -Unique)
$expected = @(1..16 | ForEach-Object { 'REQ-{0:00}' -f $_ })
if (@(Compare-Object $expected $ids).Count) { throw 'Trace IDs missing or unexpected' }
'PASS trace table ID coverage: 16/16 (coverage only, not design quality)'
'NOT RUN: Mermaid rendering, software behavior, simulator/HIL/hardware, safety timing'
