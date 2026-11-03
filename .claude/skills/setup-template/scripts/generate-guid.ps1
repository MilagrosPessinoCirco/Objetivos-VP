Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$guid = [guid]::NewGuid()
$guid.ToString("D").ToLowerInvariant()
