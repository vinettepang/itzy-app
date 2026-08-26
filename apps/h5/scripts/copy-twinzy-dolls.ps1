$assets = "C:\Users\Administrator\.cursor\projects\C-Users-ADMINI-1-AppData-Local-Temp-a0869930-0c4f-4d1d-8e2b-6a418e802ae6\assets"
$dest = "c:\projects\study\vibe-coding\itzy-app\apps\h5\src\assets\twinzy-dolls.png"
$src = Get-ChildItem -Path $assets -Filter "*86970dba*" | Select-Object -First 1
if (-not $src) {
    $src = Get-ChildItem -Path $assets -Filter "*dbe4173f*" | Select-Object -First 1
}
if (-not $src) { throw "Source image not found in $assets" }
New-Item -ItemType Directory -Force -Path (Split-Path $dest) | Out-Null
[System.IO.File]::Copy($src.FullName, $dest, $true)
Write-Output "Copied $($src.FullName) -> $dest ($((Get-Item $dest).Length) bytes)"
