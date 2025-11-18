package store.esgseed.api.soccer.stadium;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * 경기장 DTO - API 요청/응답 데이터
 */
@Schema(description = "경기장 데이터 모델")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StadiumModel {

    @Schema(description = "경기장 ID", example = "1")
    private Long stadiumId;

    @Schema(description = "경기장 고유키", example = "K01")
    private String stadiumUk;

    @Schema(description = "경기장명", example = "서울월드컵경기장")
    private String stadiumName;

    @Schema(description = "홈팀 고유키", example = "K01")
    private String homeTeamUk;

    @Schema(description = "좌석 수", example = "66704")
    private String seatCount;

    @Schema(description = "주소", example = "서울시 마포구 월드컵로 240")
    private String address;

    @Schema(description = "지역번호", example = "02")
    private String ddd;

    @Schema(description = "전화번호", example = "2128-2002")
    private String tel;
}
