package site.esgseed.api.esg.checklist;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

/**
 * 체크리스트 항목 DTO - API 요청/응답 데이터
 */
@Schema(description = "체크리스트 항목 데이터 모델")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItemModel {

    @Schema(description = "체크리스트 항목 ID", example = "1")
    private Long id;

    @Schema(description = "체크리스트 코드", example = "S2-7")
    private String code;

    @Schema(description = "제목", example = "기후회계가치 현황")
    private String title;

    @Schema(description = "설명", example = "기후회계가치 현황 기한 체크리스트 항목입니다.")
    private String description;

    @Schema(description = "상태", example = "pending")
    private String status;

    @Schema(description = "카테고리", example = "S2")
    private String category;
}
