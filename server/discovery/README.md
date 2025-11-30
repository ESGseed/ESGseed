## API Gateway (Discovery) Redis 가이드

### 실행 순서
1. `docker-compose up -d redis` 로 Redis 컨테이너 기동  
2. `docker-compose ps redis` 또는 `docker exec -it esgseed-redis redis-cli ping` 으로 상태 확인 (PONG)
3. Config / Eureka / Discovery 순서대로 기동 (`docker-compose up config-server eureka-server discovery-service`)

### 캐싱 / Rate Limit 확인
- 캐시 대상 GET 엔드포인트를 두 번 호출  
  - 1회차: 응답 헤더 `X-Cache: MISS`  
  - 2회차: `X-Cache: HIT` 로전환, Redis 키 `gateway:cache:*` 등록됨
- Rate limit 검증  
  - 동일 IP에서 분당 100회 초과 호출 시 429 + `X-RateLimit-Remaining: 0`

### 테스트
```bash
cd server/discovery
./gradlew test --no-daemon
```

- Redis 템플릿 Bean 충돌을 방지하기 위해 커스텀 `ReactiveRedisTemplate` 에 `@Primary` 지정함  
- 통합 테스트는 Config Server (http://localhost:8888) 를 조회하므로, 미기동 시 `spring.config.import=optional:` 구성이 적용되어 자동으로 넘어감


