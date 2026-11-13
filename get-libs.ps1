# Скачивает библиотеки AR.js / A-Frame в папку libs (запускать из папки ar-labs)
New-Item -ItemType Directory -Force libs | Out-Null
$files = [ordered]@{
  'aframe.min.js' = @('https://aframe.io/releases/1.3.0/aframe.min.js')
  'aframe-look-at-component.min.js' = @('https://unpkg.com/aframe-look-at-component@0.8.0/dist/aframe-look-at-component.min.js','https://cdn.jsdelivr.net/npm/aframe-look-at-component@0.8.0/dist/aframe-look-at-component.min.js')
  'ar-threex-location-only.js' = @('https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.5/three.js/build/ar-threex-location-only.js','https://unpkg.com/@ar-js-org/ar.js@3.4.5/three.js/build/ar-threex-location-only.js','https://raw.githack.com/AR-js-org/AR.js/3.4.5/three.js/build/ar-threex-location-only.js')
  'aframe-ar.js' = @('https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.5/aframe/build/aframe-ar.js','https://unpkg.com/@ar-js-org/ar.js@3.4.5/aframe/build/aframe-ar.js','https://raw.githack.com/AR-js-org/AR.js/3.4.5/aframe/build/aframe-ar.js')
}
foreach ($name in $files.Keys) {
  $ok = $false
  foreach ($url in $files[$name]) {
    try {
      Invoke-WebRequest -Uri $url -OutFile "libs/$name" -UseBasicParsing
      $kb = [math]::Round((Get-Item "libs/$name").Length / 1KB)
      if ($kb -gt 5) { Write-Host "OK   $name  $kb KB" -ForegroundColor Green; $ok = $true; break }
    } catch { Write-Host "fail $url" -ForegroundColor Yellow }
  }
  if (-not $ok) { Write-Host "ОШИБКА: не удалось скачать $name" -ForegroundColor Red }
}
