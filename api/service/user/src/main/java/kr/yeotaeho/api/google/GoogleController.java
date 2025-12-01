package kr.yeotaeho.api.google;

import kr.yeotaeho.api.dto.GoogleUserInfo;
import kr.yeotaeho.api.service.GoogleOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 구글 로그인 관련 컨트롤러
 * 
 * 주의: CORS는 Gateway에서 처리하므로 여기서는 설정하지 않습니다.
 * Gateway의 application.yaml에서 globalcors 설정을 확인하세요.
 */
@Slf4j
@RestController
@RequestMapping("/google")
@RequiredArgsConstructor
public class GoogleController {

    private final GoogleOAuthService googleOAuthService;

    /**
     * 구글 로그인 URL 요청
     * 
     * @return 구글 인증 URL
     */
    @RequestMapping(value = "/login", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Map<String, String>> getGoogleLoginUrl() {
        log.info("구글 로그인 URL 요청");

        String authUrl = googleOAuthService.getAuthorizationUrl();

        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        response.put("message", "구글 로그인 페이지로 이동하세요");

        return ResponseEntity.ok(response);
    }

    /**
     * 구글 로그인 콜백 처리 (프론트에서 code를 POST로 전송)
     * 
     * @param body code를 포함한 요청 바디
     * @return 사용자 정보 및 JWT 토큰
     */
    @PostMapping("/callback")
    public ResponseEntity<Map<String, Object>> googleCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        log.info("구글 로그인 콜백 처리 시작 (POST): code={}", code);

        try {
            // OAuth 플로우 실행 (토큰 발급 + 사용자 정보 조회)
            GoogleUserInfo userInfo = googleOAuthService.processOAuth(code);

            // TODO: 실제 구현에서는 다음 작업 수행
            // 1. DB에 사용자 정보 저장/업데이트
            // 2. JWT 토큰 생성
            // 3. 세션 또는 리프레시 토큰 저장

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "구글 로그인 성공");
            response.put("googleId", userInfo.getId());
            response.put("email", userInfo.getEmail());
            response.put("name", userInfo.getName());
            response.put("profileImage", userInfo.getPicture());

            // TODO: 실제 JWT 토큰으로 교체
            response.put("accessToken", "jwt-token-" + System.currentTimeMillis());
            response.put("tokenType", "Bearer");

            log.info("구글 로그인 성공: googleId={}", userInfo.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("구글 로그인 실패: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "구글 로그인 실패: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 구글 로그인 테스트 (기존 호환성 유지)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> googleTest() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "구글 로그인 테스트 엔드포인트");
        response.put("status", "ok");

        return ResponseEntity.ok(response);
    }
}
