package store.esgseed.api.soccer.team;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * 팀 DTO - API 요청/응답 데이터
 */
@Schema(description = "팀 데이터 모델")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamModel {

    @Schema(description = "팀 ID", example = "1")
    private Long teamId;

    @Schema(description = "팀 고유키", example = "K01")
    private String teamUk;

    @Schema(description = "연고지명", example = "서울")
    private String regionName;

    @Schema(description = "팀명", example = "FC서울")
    private String teamName;

    @Schema(description = "영문 팀명", example = "FC Seoul")
    private String eTeamName;

    @Schema(description = "창단년도", example = "1983")
    private String origYyyy;

    @Schema(description = "우편번호1", example = "121")
    private String zipCode1;

    @Schema(description = "우편번호2", example = "837")
    private String zipCode2;

    @Schema(description = "주소", example = "서울시 마포구 월드컵로 240")
    private String address;

    @Schema(description = "지역번호", example = "02")
    private String ddd;

    @Schema(description = "전화번호", example = "2128-2002")
    private String tel;

    @Schema(description = "팩스번호", example = "2128-2003")
    private String fax;

    @Schema(description = "홈페이지", example = "https://www.fcseoul.com")
    private String homepage;

    @Schema(description = "구단주", example = "홍길동")
    private String owner;
}
