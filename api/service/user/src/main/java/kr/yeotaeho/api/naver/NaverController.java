package kr.yeotaeho.api.naver;

import kr.yeotaeho.api.dto.NaverUserInfo;
import kr.yeotaeho.api.service.NaverOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 네이버 로그인 관련 컨트롤러
 * 
 * 주의: CORS는 Gateway에서 처리하므로 여기서는 설정하지 않습니다.
 * Gateway의 application.yaml에서 globalcors 설정을 확인하세요.
 */
@Slf4j
@RestController
@RequestMapping("/naver")
@RequiredArgsConstructor
public class NaverController {

    private final NaverOAuthService naverOAuthService;

    /**
     * 네이버 로그인 URL 요청
     * 
     * @return 네이버 인증 URL
     */
    @RequestMapping(value = "/login", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Map<String, String>> getNaverLoginUrl() {
        log.info("네이버 로그인 URL 요청");

        String authUrl = naverOAuthService.getAuthorizationUrl();

        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        response.put("message", "네이버 로그인 페이지로 이동하세요");

        return ResponseEntity.ok(response);
    }

    /**
     * 네이버 로그인 콜백 처리 (프론트에서 code와 state를 POST로 전송)
     * 
     * @param body code와 state를 포함한 요청 바디
     * @return 사용자 정보 및 JWT 토큰
     */
    @PostMapping("/callback")
    public ResponseEntity<Map<String, Object>> naverCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        String state = body.get("state");
        log.info("네이버 로그인 콜백 처리 시작 (POST): code={}, state={}", code, state);

        try {
            // OAuth 플로우 실행 (토큰 발급 + 사용자 정보 조회)
            NaverUserInfo userInfo = naverOAuthService.processOAuth(code, state);

            // TODO: 실제 구현에서는 다음 작업 수행
            // 1. DB에 사용자 정보 저장/업데이트
            // 2. JWT 토큰 생성
            // 3. 세션 또는 리프레시 토큰 저장

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "네이버 로그인 성공");

            // 사용자 정보 추가
            if (userInfo.getResponse() != null) {
                response.put("naverId", userInfo.getResponse().getId());
                response.put("email", userInfo.getResponse().getEmail());
                response.put("nickname", userInfo.getResponse().getNickname());
                response.put("name", userInfo.getResponse().getName());
                response.put("profileImage", userInfo.getResponse().getProfileImage());
            }

            // TODO: 실제 JWT 토큰으로 교체
            response.put("accessToken", "jwt-token-" + System.currentTimeMillis());
            response.put("tokenType", "Bearer");

            log.info("네이버 로그인 성공: naverId={}", userInfo.getResponse().getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("네이버 로그인 실패: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "네이버 로그인 실패: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 네이버 로그인 테스트 (기존 호환성 유지)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> naverTest() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "네이버 로그인 테스트 엔드포인트");
        response.put("status", "ok");

        return ResponseEntity.ok(response);
    }
}
