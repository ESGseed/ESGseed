# DB 확인 스크립트
$env:PGPASSWORD="esgseed1234"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "테이블 목록 (esgseeddb)" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
docker exec -it esgseed psql -U esgseed -d esgseeddb -c "\dt"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "teams 테이블 구조" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
docker exec -it esgseed psql -U esgseed -d esgseeddb -c "\d+ teams"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "players 테이블 구조" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
docker exec -it esgseed psql -U esgseed -d esgseeddb -c "\d+ players"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "stadiums 테이블 구조" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
docker exec -it esgseed psql -U esgseed -d esgseeddb -c "\d+ stadiums"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "schedules 테이블 구조" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
docker exec -it esgseed psql -U esgseed -d esgseeddb -c "\d+ schedules"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "데이터 수 확인" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
docker exec -it esgseed psql -U esgseed -d esgseeddb -c "
SELECT 
    'teams' as table_name, COUNT(*) as count FROM teams
UNION ALL
SELECT 'players', COUNT(*) FROM players
UNION ALL
SELECT 'stadiums', COUNT(*) FROM stadiums
UNION ALL
SELECT 'schedules', COUNT(*) FROM schedules;
"

