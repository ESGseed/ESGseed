package kr.yeotaeho.api.router;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * User Service 라우터 설정
 * 
 * 주의: 현재는 application.yaml에서 라우팅을 설정하고 있습니다.
 * Java 코드로 라우팅을 설정하려면 아래 주석을 해제하고,
 * application.yaml의 routes 설정을 제거하세요.
 * 
 * application.yaml과 이 클래스가 동시에 활성화되면 충돌이 발생할 수 있습니다.
 */
// @Configuration
public class UserRouter {

    /**
     * 카카오 로그인 관련 라우팅 설정 (선택사항)
     * 
     * 라우팅 규칙:
     * - Gateway: /api/kakao/** 
     * - User Service: /api/kakao/** (KakaoController)
     * 
     * 예시:
     * - http://localhost:8080/api/kakao/login → http://user-service:8083/api/kakao/login
     * - http://localhost:8080/api/kakao/callback → http://user-service:8083/api/kakao/callback
     * 
     * 현재는 application.yaml에서 라우팅을 설정하고 있으므로 주석 처리되어 있습니다.
     */
    /*
    @Bean
    public RouteLocator kakaoRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("kakao-service", r -> r
                        .path("/api/kakao/**")
                        .uri("lb://user-service") // Eureka를 통한 user-service 라우팅
                )
                .build();
    }
    */

    // CORS 설정은 application.yaml의 globalcors에서 처리
    // CorsWebFilter는 Spring Cloud Gateway에서 제대로 작동하지 않을 수 있으므로
    // application.yaml의 globalcors 설정을 사용
}
