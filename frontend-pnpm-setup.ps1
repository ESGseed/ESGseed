# frontend-pnpm-setup.ps1

Set-Location frontend

Write-Host "1. package-lock.json 삭제" -ForegroundColor Cyan
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue

Write-Host "2. pnpm 전역 설치" -ForegroundColor Cyan
npm install -g pnpm

Write-Host "3. pnpm install 실행" -ForegroundColor Cyan
pnpm install

Write-Host "4. pnpm-lock.yaml 확인" -ForegroundColor Cyan
if (Test-Path pnpm-lock.yaml) {
    Write-Host "성공: pnpm-lock.yaml 생성됨!" -ForegroundColor Green
} else {
    Write-Host "실패: pnpm-lock.yaml 없음!" -ForegroundColor Red
    exit 1
}

Write-Host "5. Git에 추가" -ForegroundColor Cyan
git add pnpm-lock.yaml
git add -u  # 삭제된 package-lock.json도 반영

Write-Host "완료! 이제 ./docker-build.ps1 실행하세요." -ForegroundColor Green

