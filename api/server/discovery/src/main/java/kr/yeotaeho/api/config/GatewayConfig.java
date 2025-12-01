package kr.yeotaeho.api.config;

// import org.springframework.cloud.gateway.route.RouteLocator;
// import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
// import org.springframework.context.annotation.Bean;
// import org.springframework.context.annotation.Configuration;

/**
 * Gateway 라우팅 설정 클래스
 * 
 * 주의: 현재는 application.yaml에서 라우팅을 설정하고 있습니다.
 * Java 코드로 라우팅을 설정하려면 아래 주석을 해제하고,
 * application.yaml의 routes 설정을 제거하세요.
 * 
 * application.yaml과 이 클래스가 동시에 활성화되면 충돌이 발생할 수 있습니다.
 */
// @Configuration
public class GatewayConfig {

    /**
     * Java 코드로 라우팅 설정 (선택사항)
     * 
     * 사용 방법:
     * 1. @Configuration 주석 해제
     * 2. application.yaml의 spring.cloud.gateway.routes 제거
     * 3. 아래 메서드 주석 해제
     */
    /*
     * @Bean
     * public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
     * return builder.routes()
     * // User Service 라우팅
     * .route("user-service", r -> r
     * .path("/api/users/**")
     * .filters(f -> f.stripPrefix(2)) // /api/users 제거 → /users/**만 전달
     * .uri("lb://user-service")) // 로드밸런서를 통한 라우팅
     * 
     * // Common Service 라우팅
     * .route("common-service", r -> r
     * .path("/api/common/**")
     * .filters(f -> f.stripPrefix(2)) // /api/common 제거 → /common/**만 전달
     * .uri("lb://common-service"))
     * 
     * .build();
     * }
     */
}
