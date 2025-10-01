# Firebase Storage CORS Fix Script for Windows PowerShell
# Run as: .\fix-storage-cors.ps1

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Firebase Storage CORS 자동 설정" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# Check if gcloud is installed
$gcloudPath = Get-Command gcloud -ErrorAction SilentlyContinue
if (-not $gcloudPath) {
    Write-Host "❌ Google Cloud SDK가 설치되지 않았습니다." -ForegroundColor Red
    Write-Host ""
    Write-Host "다운로드 링크: https://cloud.google.com/sdk/docs/install" -ForegroundColor Yellow
    Write-Host "설치 후 이 스크립트를 다시 실행하세요." -ForegroundColor Yellow
    exit
}

Write-Host "✅ Google Cloud SDK 감지됨" -ForegroundColor Green
Write-Host ""

# Get current project
Write-Host "현재 프로젝트 확인 중..." -ForegroundColor Yellow
$currentProject = gcloud config get-value project 2>$null

if ($currentProject -ne "jobmatching-9fed0") {
    Write-Host "프로젝트 설정 중..." -ForegroundColor Yellow
    gcloud config set project jobmatching-9fed0
}

# Ask for bucket name
Write-Host ""
Write-Host "Firebase Console에서 확인한 Storage 버킷명을 입력하세요" -ForegroundColor Cyan
Write-Host "예시: jobmatching-9fed0.appspot.com 또는 jobmatching-9fed0.firebasestorage.app" -ForegroundColor Gray
$bucketName = Read-Host "버킷명"

if ([string]::IsNullOrWhiteSpace($bucketName)) {
    Write-Host "❌ 버킷명이 입력되지 않았습니다." -ForegroundColor Red
    exit
}

# Create improved CORS configuration
$corsConfig = @'
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS"],
    "maxAgeSeconds": 3600,
    "responseHeader": ["*"]
  }
]
'@

# Save CORS config to file
$corsConfig | Out-File -FilePath "cors-temp.json" -Encoding UTF8

Write-Host ""
Write-Host "CORS 설정 적용 중..." -ForegroundColor Yellow
Write-Host "버킷: gs://$bucketName" -ForegroundColor Gray

# Apply CORS
try {
    gsutil cors set cors-temp.json "gs://$bucketName"
    Write-Host "✅ CORS 설정이 성공적으로 적용되었습니다!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "설정 확인 중..." -ForegroundColor Yellow
    gsutil cors get "gs://$bucketName"
    
} catch {
    Write-Host "❌ CORS 설정 실패: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "다음을 확인하세요:" -ForegroundColor Yellow
    Write-Host "1. Google Cloud에 로그인: gcloud auth login" -ForegroundColor Gray
    Write-Host "2. 올바른 버킷명 입력" -ForegroundColor Gray
    Write-Host "3. Storage 권한 확인" -ForegroundColor Gray
}

# Clean up temp file
Remove-Item -Path "cors-temp.json" -ErrorAction SilentlyContinue

# Update .env.local
Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ".env.local 파일 업데이트" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

$envPath = ".env.local"
if (Test-Path $envPath) {
    $envContent = Get-Content $envPath -Raw
    $updatedContent = $envContent -replace 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="[^"]*"', "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=`"$bucketName`""
    $updatedContent | Out-File -FilePath $envPath -Encoding UTF8
    Write-Host "✅ .env.local 파일이 업데이트되었습니다" -ForegroundColor Green
} else {
    Write-Host "⚠️  .env.local 파일을 찾을 수 없습니다" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Green
Write-Host "✅ 설정 완료!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Green
Write-Host ""
Write-Host "다음 단계:" -ForegroundColor Cyan
Write-Host "1. 개발 서버 재시작: npm run dev" -ForegroundColor White
Write-Host "2. 브라우저 캐시 삭제 (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "3. 온보딩 페이지에서 다시 테스트" -ForegroundColor White
Write-Host ""