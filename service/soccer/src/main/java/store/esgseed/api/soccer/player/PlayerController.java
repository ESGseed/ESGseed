package store.esgseed.api.soccer.player;

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
 * 선수 API 컨트롤러
 */
@Tag(name = "Player API", description = "선수 데이터 관리 API")
@RestController
@RequestMapping("/api/players")
@RequiredArgsConstructor
public class PlayerController {

    private final PlayerService playerService;

    @Operation(summary = "선수 데이터 생성", description = "새로운 선수 데이터를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping
    public Messenger<PlayerModel> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "생성할 선수 데이터", required = true) @RequestBody PlayerModel dto) {
        PlayerModel response = playerService.create(dto);
        return Messenger.created("선수 데이터가 생성되었습니다.", response);
    }

    @Operation(summary = "선수 데이터 조회", description = "ID로 특정 선수 데이터를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/{id}")
    public Messenger<PlayerModel> getById(
            @Parameter(description = "조회할 선수 ID", required = true) @PathVariable Long id) {
        PlayerModel response = playerService.getById(id);
        return Messenger.ok(response);
    }

    @Operation(summary = "선수 데이터 목록 조회", description = "모든 선수 데이터를 조회하거나 이름/포지션으로 검색합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public Messenger<List<PlayerModel>> getAll(
            @Parameter(description = "검색할 선수명 (선택)", required = false) @RequestParam(required = false) String name,
            @Parameter(description = "검색할 포지션 (선택)", required = false) @RequestParam(required = false) String position) {
        List<PlayerModel> responses;

        if (name != null) {
            responses = playerService.searchByName(name);
        } else if (position != null) {
            responses = playerService.getByPosition(position);
        } else {
            responses = playerService.getAll();
        }

        return Messenger.ok(responses);
    }

    @Operation(summary = "선수 데이터 수정", description = "기존 선수 데이터를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @PutMapping("/{id}")
    public Messenger<PlayerModel> update(
            @Parameter(description = "수정할 선수 ID", required = true) @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(description = "수정할 선수 데이터", required = true) @RequestBody PlayerModel dto) {
        PlayerModel response = playerService.update(id, dto);
        return Messenger.ok("선수 데이터가 수정되었습니다.", response);
    }

    @Operation(summary = "선수 데이터 삭제", description = "ID로 특정 선수 데이터를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @DeleteMapping("/{id}")
    public Messenger<Void> delete(
            @Parameter(description = "삭제할 선수 ID", required = true) @PathVariable Long id) {
        playerService.delete(id);
        return Messenger.noContent("선수 데이터가 삭제되었습니다.");
    }
}