package store.esgseed.api.soccer.stadium;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import store.esgseed.api.soccer.common.Messenger;

import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 경기장 API 컨트롤러
 */
@Tag(name = "Stadium API", description = "경기장 데이터 관리 API")
@RestController
@RequestMapping("/api/stadiums")
@RequiredArgsConstructor
public class StadiumController {

    private final StadiumService stadiumService;

    @Operation(summary = "경기장 데이터 생성", description = "새로운 경기장 데이터를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping
    public Messenger<StadiumModel> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "생성할 경기장 데이터", required = true) @RequestBody StadiumModel dto) {
        StadiumModel response = stadiumService.create(dto);
        return Messenger.created("경기장 데이터가 생성되었습니다.", response);
    }

    @Operation(summary = "경기장 데이터 조회", description = "ID로 특정 경기장 데이터를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/{id}")
    public Messenger<StadiumModel> getById(
            @Parameter(description = "조회할 경기장 ID", required = true) @PathVariable Long id) {
        StadiumModel response = stadiumService.getById(id);
        return Messenger.ok(response);
    }

    @Operation(summary = "경기장 데이터 목록 조회", description = "모든 경기장 데이터를 조회하거나 경기장명/홈팀으로 검색합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public Messenger<List<StadiumModel>> getAll(
            @Parameter(description = "검색할 경기장명 (선택)", required = false) @RequestParam(required = false) String name,
            @Parameter(description = "검색할 홈팀 고유키 (선택)", required = false) @RequestParam(required = false) String homeTeamUk) {
        List<StadiumModel> responses;

        if (name != null) {
            responses = stadiumService.searchByName(name);
        } else if (homeTeamUk != null) {
            responses = stadiumService.getByHomeTeam(homeTeamUk);
        } else {
            responses = stadiumService.getAll();
        }

        return Messenger.ok(responses);
    }

    @Operation(summary = "경기장 데이터 수정", description = "기존 경기장 데이터를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @PutMapping("/{id}")
    public Messenger<StadiumModel> update(
            @Parameter(description = "수정할 경기장 ID", required = true) @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "수정할 경기장 데이터", required = true) @RequestBody StadiumModel dto) {
        StadiumModel response = stadiumService.update(id, dto);
        return Messenger.ok("경기장 데이터가 수정되었습니다.", response);
    }

    @Operation(summary = "경기장 데이터 삭제", description = "ID로 특정 경기장 데이터를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @DeleteMapping("/{id}")
    public Messenger<Void> delete(
            @Parameter(description = "삭제할 경기장 ID", required = true) @PathVariable Long id) {
        stadiumService.delete(id);
        return Messenger.noContent("경기장 데이터가 삭제되었습니다.");
    }
}
