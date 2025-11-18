package store.esgseed.api.soccer.common;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

/**
 * REST API 공통 응답 메신저
 */
@Getter
@Builder
public class Messenger<T> {

    private final int status; // HTTP 상태 코드
    private final String message; // 응답 메시지
    private final T data; // 응답 데이터
    private final LocalDateTime timestamp; // 응답 시간

    // 200 OK - 성공 (데이터 포함)
    public static <T> Messenger<T> ok(T data) {
        return Messenger.<T>builder()
                .status(200)
                .message("OK")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 200 OK - 성공 (메시지 커스텀)
    public static <T> Messenger<T> ok(String message, T data) {
        return Messenger.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 201 Created - 생성 성공
    public static <T> Messenger<T> created(T data) {
        return Messenger.<T>builder()
                .status(201)
                .message("Created")
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 201 Created - 생성 성공 (메시지 커스텀)
    public static <T> Messenger<T> created(String message, T data) {
        return Messenger.<T>builder()
                .status(201)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 204 No Content - 성공 (데이터 없음)
    public static Messenger<Void> noContent() {
        return Messenger.<Void>builder()
                .status(204)
                .message("No Content")
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 204 No Content - 성공 (메시지 커스텀)
    public static Messenger<Void> noContent(String message) {
        return Messenger.<Void>builder()
                .status(204)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 400 Bad Request - 잘못된 요청
    public static <T> Messenger<T> badRequest(String message) {
        return Messenger.<T>builder()
                .status(400)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 404 Not Found - 리소스 없음
    public static <T> Messenger<T> notFound(String message) {
        return Messenger.<T>builder()
                .status(404)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 500 Internal Server Error - 서버 에러
    public static <T> Messenger<T> error(String message) {
        return Messenger.<T>builder()
                .status(500)
                .message(message)
                .data(null)
                .timestamp(LocalDateTime.now())
                .build();
    }

    // 커스텀 상태 코드
    public static <T> Messenger<T> custom(int status, String message, T data) {
        return Messenger.<T>builder()
                .status(status)
                .message(message)
                .data(data)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
