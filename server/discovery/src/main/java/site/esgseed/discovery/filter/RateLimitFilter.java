package site.esgseed.discovery.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;

/**
 * IP별 Rate Limiting을 수행하는 Global Filter
 * Redis를 사용하여 슬라이딩 윈도우 알고리즘 구현
 */
@Component
public class RateLimitFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(RateLimitFilter.class);
    private static final String RATE_LIMIT_KEY_PREFIX = "gateway:ratelimit:";
    private static final int MAX_REQUESTS = 100; // 분당 최대 요청 수
    private static final Duration TIME_WINDOW = Duration.ofMinutes(1);

    @Autowired
    private ReactiveRedisTemplate<String, String> redisTemplate;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String clientIp = getClientIp(request);
        String rateLimitKey = RATE_LIMIT_KEY_PREFIX + clientIp;

        return redisTemplate.opsForValue().increment(rateLimitKey)
                .flatMap(count -> {
                    if (count == 1) {
                        // 첫 요청인 경우 TTL 설정
                        return redisTemplate.expire(rateLimitKey, TIME_WINDOW)
                                .then(checkRateLimit(count, exchange, chain));
                    } else {
                        return checkRateLimit(count, exchange, chain);
                    }
                })
                .onErrorResume(error -> {
                    log.error("Rate limit check failed: ", error);
                    // Redis 오류 시 요청 허용 (fail-open)
                    return chain.filter(exchange);
                });
    }

    private Mono<Void> checkRateLimit(Long count, ServerWebExchange exchange, GatewayFilterChain chain) {
        if (count > MAX_REQUESTS) {
            log.warn("Rate limit exceeded for IP: {}. Count: {}", getClientIp(exchange.getRequest()), count);
            return handleRateLimitExceeded(exchange);
        }

        // Rate limit 헤더 추가
        exchange.getResponse().getHeaders().add("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS));
        exchange.getResponse().getHeaders().add("X-RateLimit-Remaining", String.valueOf(Math.max(0, MAX_REQUESTS - count.intValue())));

        return chain.filter(exchange);
    }

    private Mono<Void> handleRateLimitExceeded(ServerWebExchange exchange) {
        ServerHttpResponse response = exchange.getResponse();
        response.setStatusCode(HttpStatus.TOO_MANY_REQUESTS);
        response.getHeaders().add("Content-Type", "application/json;charset=UTF-8");
        response.getHeaders().add("X-RateLimit-Limit", String.valueOf(MAX_REQUESTS));
        response.getHeaders().add("X-RateLimit-Remaining", "0");

        String body = "{\"error\": \"Too Many Requests\", \"message\": \"Rate limit exceeded. Please try again later.\"}";
        DataBuffer buffer = response.bufferFactory().wrap(body.getBytes(StandardCharsets.UTF_8));
        return response.writeWith(Mono.just(buffer));
    }

    private String getClientIp(ServerHttpRequest request) {
        String xForwardedFor = request.getHeaders().getFirst("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty()) {
            return xForwardedFor.split(",")[0].trim();
        }

        String xRealIp = request.getHeaders().getFirst("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty()) {
            return xRealIp;
        }

        return request.getRemoteAddress() != null 
                ? request.getRemoteAddress().getAddress().getHostAddress() 
                : "unknown";
    }

    @Override
    public int getOrder() {
        // 캐시 필터보다 먼저 실행 (Rate limit 체크 후 캐싱)
        return -200;
    }
}

