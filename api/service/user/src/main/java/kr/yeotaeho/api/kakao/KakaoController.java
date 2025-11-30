package kr.yeotaeho.api.kakao;

import kr.yeotaeho.api.dto.KakaoUserInfo;
import kr.yeotaeho.api.service.KakaoOAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * 카카오 로그인 관련 컨트롤러
 * 
 * 주의: CORS는 Gateway에서 처리하므로 여기서는 설정하지 않습니다.
 * Gateway의 application.yaml에서 globalcors 설정을 확인하세요.
 */
@Slf4j
@RestController
@RequestMapping("/kakao")
@RequiredArgsConstructor
public class KakaoController {

    private final KakaoOAuthService kakaoOAuthService;

    /**
     * 카카오 로그인 URL 요청
     * 
     * @return 카카오 인증 URL
     */
    @RequestMapping(value = "/login", method = { RequestMethod.GET, RequestMethod.POST })
    public ResponseEntity<Map<String, String>> getKakaoLoginUrl() {
        log.info("카카오 로그인 URL 요청");

        String authUrl = kakaoOAuthService.getAuthorizationUrl();

        Map<String, String> response = new HashMap<>();
        response.put("authUrl", authUrl);
        response.put("message", "카카오 로그인 페이지로 이동하세요");

        return ResponseEntity.ok(response);
    }

    /**
     * 카카오 로그인 콜백 처리 (프론트에서 code를 POST로 전송)
     * 
     * @param body code를 포함한 요청 바디
     * @return 사용자 정보 및 JWT 토큰
     */
    @PostMapping("/callback")
    public ResponseEntity<Map<String, Object>> kakaoCallback(@RequestBody Map<String, String> body) {
        String code = body.get("code");
        log.info("카카오 로그인 콜백 처리 시작 (POST): code={}", code);

        try {
            // OAuth 플로우 실행 (토큰 발급 + 사용자 정보 조회)
            KakaoUserInfo userInfo = kakaoOAuthService.processOAuth(code);

            // TODO: 실제 구현에서는 다음 작업 수행
            // 1. DB에 사용자 정보 저장/업데이트
            // 2. JWT 토큰 생성
            // 3. 세션 또는 리프레시 토큰 저장

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "카카오 로그인 성공");
            response.put("kakaoId", userInfo.getId());

            // 사용자 정보 추가
            if (userInfo.getKakaoAccount() != null) {
                response.put("email", userInfo.getKakaoAccount().getEmail());

                if (userInfo.getKakaoAccount().getProfile() != null) {
                    response.put("nickname", userInfo.getKakaoAccount().getProfile().getNickname());
                    response.put("profileImage", userInfo.getKakaoAccount().getProfile().getProfileImageUrl());
                }
            }

            // TODO: 실제 JWT 토큰으로 교체
            response.put("accessToken", "jwt-token-" + System.currentTimeMillis());
            response.put("tokenType", "Bearer");

            log.info("카카오 로그인 성공: kakaoId={}", userInfo.getId());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("카카오 로그인 실패: {}", e.getMessage(), e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "카카오 로그인 실패: " + e.getMessage());
            errorResponse.put("error", e.getClass().getSimpleName());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    /**
     * 카카오 로그인 테스트 (기존 호환성 유지)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> kakaoTest() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "카카오 로그인 테스트 엔드포인트");
        response.put("status", "ok");

        return ResponseEntity.ok(response);
    }
}
