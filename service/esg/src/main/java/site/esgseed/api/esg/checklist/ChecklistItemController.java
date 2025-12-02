package site.esgseed.api.esg.checklist;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import site.esgseed.api.esg.common.Messenger;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 체크리스트 항목 API 컨트롤러
 */
@Tag(name = "Checklist API", description = "ESG 체크리스트 데이터 관리 API")
@RestController
@RequestMapping("/api/checklists")
@RequiredArgsConstructor
public class ChecklistItemController {

    private final ChecklistItemService checklistItemService;

    @Operation(summary = "체크리스트 항목 데이터 생성", description = "새로운 체크리스트 항목 데이터를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping
    public Messenger<ChecklistItemModel> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "생성할 체크리스트 항목 데이터", required = true) @RequestBody ChecklistItemModel dto) {
        ChecklistItemModel response = checklistItemService.create(dto);
        return Messenger.created("체크리스트 항목이 생성되었습니다.", response);
    }

    @Operation(summary = "체크리스트 항목 데이터 조회", description = "ID로 특정 체크리스트 항목 데이터를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/{id}")
    public Messenger<ChecklistItemModel> getById(
            @Parameter(description = "조회할 체크리스트 항목 ID", required = true) @PathVariable Long id) {
        ChecklistItemModel response = checklistItemService.getById(id);
        return Messenger.ok(response);
    }

    @Operation(summary = "체크리스트 항목 데이터 목록 조회", description = "모든 체크리스트 항목 데이터를 조회하거나 카테고리/상태로 필터링합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public Messenger<List<ChecklistItemModel>> getAll(
            @Parameter(description = "검색할 카테고리 (선택)", required = false) @RequestParam(required = false) String category,
            @Parameter(description = "검색할 상태 (선택)", required = false) @RequestParam(required = false) String status) {
        List<ChecklistItemModel> responses;

        if (category != null) {
            responses = checklistItemService.getByCategory(category);
        } else if (status != null) {
            responses = checklistItemService.getByStatus(status);
        } else {
            responses = checklistItemService.getAll();
        }

        return Messenger.ok(responses);
    }

    @Operation(summary = "체크리스트 항목 데이터 수정", description = "기존 체크리스트 항목 데이터를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @PutMapping("/{id}")
    public Messenger<ChecklistItemModel> update(
            @Parameter(description = "수정할 체크리스트 항목 ID", required = true) @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "수정할 체크리스트 항목 데이터", required = true) @RequestBody ChecklistItemModel dto) {
        ChecklistItemModel response = checklistItemService.update(id, dto);
        return Messenger.ok("체크리스트 항목이 수정되었습니다.", response);
    }

    @Operation(summary = "체크리스트 항목 데이터 삭제", description = "ID로 특정 체크리스트 항목 데이터를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @DeleteMapping("/{id}")
    public Messenger<Void> delete(
            @Parameter(description = "삭제할 체크리스트 항목 ID", required = true) @PathVariable Long id) {
        checklistItemService.delete(id);
        return Messenger.noContent("체크리스트 항목이 삭제되었습니다.");
    }
}
