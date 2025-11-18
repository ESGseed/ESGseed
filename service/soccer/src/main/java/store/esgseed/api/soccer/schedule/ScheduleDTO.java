package store.esgseed.api.soccer.schedule;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * 일정 DTO - API 요청/응답 데이터
 */
@Schema(description = "일정 데이터 모델")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScheduleDTO {

    @Schema(description = "일정 ID", example = "1")
    private Long id;

    @Schema(description = "경기장 고유키", example = "K01")
    private String stadiumUk;

    @Schema(description = "경기 날짜", example = "2024-03-15")
    private String scheDate;

    @Schema(description = "경기 구분", example = "정규리그")
    private String gubun;

    @Schema(description = "홈팀 고유키", example = "K01")
    private String homeTeamUk;

    @Schema(description = "원정팀 고유키", example = "K02")
    private String awayTeamUk;

    @Schema(description = "홈팀 득점", example = "3")
    private String homeScore;

    @Schema(description = "원정팀 득점", example = "2")
    private String awayScore;
}

