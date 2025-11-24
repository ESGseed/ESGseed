package site.esgseed.discovery.filter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.core.io.buffer.DataBufferUtils;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.server.reactive.ServerHttpResponseDecorator;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.concurrent.atomic.AtomicReference;

/**
 * GET 요청의 응답을 Redis에 캐싱하는 Global Filter
 * Cache-Control 헤더를 확인하여 TTL 설정
 */
@Component
public class GlobalCacheFilter implements GlobalFilter, Ordered {

    private static final Logger log = LoggerFactory.getLogger(GlobalCacheFilter.class);
    private static final String CACHE_KEY_PREFIX = "gateway:cache:";
    private static final Duration DEFAULT_CACHE_TTL = Duration.ofMinutes(5);

    @Autowired
    private ReactiveRedisTemplate<String, String> redisTemplate;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // GET 요청만 캐싱
        if (!HttpMethod.GET.equals(request.getMethod())) {
            return chain.filter(exchange);
        }

        String cacheKey = generateCacheKey(request);

        // Redis에서 캐시 확인
        return redisTemplate.opsForValue().get(cacheKey)
                .flatMap(cachedResponse -> {
                    if (cachedResponse != null) {
                        log.debug("Cache HIT for key: {}", cacheKey);
                        ServerHttpResponse response = exchange.getResponse();
                        response.setStatusCode(HttpStatus.OK);
                        response.getHeaders().add("X-Cache", "HIT");
                        DataBuffer buffer = response.bufferFactory()
                                .wrap(cachedResponse.getBytes(StandardCharsets.UTF_8));
                        return response.writeWith(Mono.just(buffer));
                    } else {
                        log.debug("Cache MISS for key: {}", cacheKey);
                        return cacheResponse(exchange, chain, cacheKey);
                    }
                })
                .switchIfEmpty(cacheResponse(exchange, chain, cacheKey));
    }

    private Mono<Void> cacheResponse(ServerWebExchange exchange, GatewayFilterChain chain, String cacheKey) {
        ServerHttpResponse originalResponse = exchange.getResponse();

        AtomicReference<String> responseBody = new AtomicReference<>("");

        ServerHttpResponseDecorator decoratedResponse = new ServerHttpResponseDecorator(originalResponse) {
            @Override
            public Mono<Void> writeWith(org.reactivestreams.Publisher<? extends DataBuffer> body) {
                if (getStatusCode() != null && getStatusCode().is2xxSuccessful()) {
                    return DataBufferUtils.join(body)
                            .flatMap(dataBuffer -> {
                                byte[] content = new byte[dataBuffer.readableByteCount()];
                                dataBuffer.read(content);
                                DataBufferUtils.release(dataBuffer);

                                String bodyString = new String(content, StandardCharsets.UTF_8);
                                responseBody.set(bodyString);

                                // Cache-Control 헤더 확인하여 TTL 결정
                                Duration ttl = getCacheTTL(exchange);

                                // Redis에 캐싱
                                return redisTemplate.opsForValue()
                                        .set(cacheKey, bodyString, ttl)
                                        .then(Mono.fromRunnable(() -> {
                                            log.debug("Cached response for key: {} with TTL: {}", cacheKey, ttl);
                                            originalResponse.getHeaders().add("X-Cache", "MISS");
                                        }))
                                        .then(super.writeWith(Mono.just(
                                                originalResponse.bufferFactory().wrap(content))));
                            });
                } else {
                    return super.writeWith(body);
                }
            }
        };

        return chain.filter(exchange.mutate().response(decoratedResponse).build());
    }

    private String generateCacheKey(ServerHttpRequest request) {
        String uri = request.getURI().getPath();
        String query = request.getURI().getQuery();
        String fullUri = query != null ? uri + "?" + query : uri;
        return CACHE_KEY_PREFIX + fullUri.hashCode();
    }

    private Duration getCacheTTL(ServerWebExchange exchange) {
        HttpHeaders headers = exchange.getResponse().getHeaders();
        String cacheControl = headers.getFirst(HttpHeaders.CACHE_CONTROL);

        if (cacheControl != null && cacheControl.contains("max-age")) {
            try {
                String maxAge = cacheControl.split("max-age=")[1].split(",")[0].trim();
                return Duration.ofSeconds(Long.parseLong(maxAge));
            } catch (Exception e) {
                log.warn("Failed to parse Cache-Control header: {}", cacheControl);
            }
        }

        return DEFAULT_CACHE_TTL;
    }

    @Override
    public int getOrder() {
        // 낮은 숫자가 먼저 실행됨
        return -100;
    }
}
