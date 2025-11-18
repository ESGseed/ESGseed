-- 각 서비스별 데이터베이스 생성
CREATE DATABASE common_db;
CREATE DATABASE user_db;
CREATE DATABASE soccer_db;

-- 사용자 권한 부여
GRANT ALL PRIVILEGES ON DATABASE common_db TO esgseed;
GRANT ALL PRIVILEGES ON DATABASE user_db TO esgseed;
GRANT ALL PRIVILEGES ON DATABASE soccer_db TO esgseed;

