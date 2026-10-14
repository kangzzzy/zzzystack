$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$doc = Get-Content -LiteralPath (Join-Path $root 'architecture.md') -Raw -Encoding UTF8
$inputText = Get-Content -LiteralPath (Join-Path $root 'requirements.md') -Raw -Encoding UTF8
$known = @([regex]::Matches($inputText, '\| (REQ-\d{2}) \|') | ForEach-Object { $_.Groups[1].Value } | Sort-Object -Unique)
$referenced = @([regex]::Matches($doc, 'REQ-\d{2}') | ForEach-Object { $_.Value } | Sort-Object -Unique)
if (@($referenced | Where-Object { $_ -notin $known }).Count) { throw 'Unknown requirement reference' }
$rows = @($doc -split '\r?\n' | Where-Object { $_ -match '^\| T\d{2} \|' })
$testIds = @($rows | ForEach-Object { ($_ -split '\|')[1].Trim() })
if ($testIds.Count -ne 10 -or @($testIds | Sort-Object -Unique).Count -ne 10) { throw 'Missing or duplicated test row' }
foreach ($row in $rows) {
  $cells = $row -split '\|'
  if ($cells.Count -ne 6 -or [string]::IsNullOrWhiteSpace($cells[2]) -or [string]::IsNullOrWhiteSpace($cells[3])) { throw 'Malformed test plan row' }
}
$covered = @([regex]::Matches(($rows -join "`n"), 'REQ-\d{2}') | ForEach-Object { $_.Value } | Sort-Object -Unique)
# REQ-15 is the test-planning requirement itself; all behavior/diagram requirements must map to a row.
$missing = @($known | Where-Object { $_ -ne 'REQ-15' -and $_ -notin $covered })
if ($missing.Count) { throw "Unmapped requirements: $missing" }
$diagram = [regex]::Match($doc, '(?s)```mermaid\r?\n(.*?)```').Groups[1].Value
if (!$diagram) { throw 'Missing diagram source' }
$nodes = @([regex]::Matches($diagram, '(?m)^\s*(\w+)\[') | ForEach-Object { $_.Groups[1].Value })
$nodes += @([regex]::Matches($diagram, '(?m)^\s*(\w+)\[?\(') | ForEach-Object { $_.Groups[1].Value })
$edges = [regex]::Matches($diagram, '(?m)^\s*(\w+)\s+(?:-->|<-->|-\.->)\|"([^"]+)"\|\s+(\w+)\s*$')
if ($edges.Count -ne 18) { throw "Unexpected edge count: $($edges.Count)" }
foreach ($edge in $edges) {
  if ($edge.Groups[1].Value -notin $nodes -or $edge.Groups[3].Value -notin $nodes) { throw "Undeclared graph endpoint: $edge" }
}
$result = [ordered]@{
  input_sha256 = (Get-FileHash -LiteralPath (Join-Path $root 'requirements.md') -Algorithm SHA256).Hash
  architecture_sha256 = (Get-FileHash -LiteralPath (Join-Path $root 'architecture.md') -Algorithm SHA256).Hash
  architecture_lines = ($doc -split '\r?\n').Count
  requirement_reference_count = $referenced.Count
  test_rows = $rows.Count
  behavior_requirements_mapped = $covered.Count
  diagram_declared_nodes = @($nodes | Sort-Object -Unique).Count
  diagram_valid_endpoint_edges = $edges.Count
  result = 'PASS: structural references and traceability only; no semantic/render/runtime verification'
}
$result | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $root 'check-results.json') -Encoding UTF8
$result | ConvertTo-Json
