package store.esgseed.api.soccer.schedule;

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
 * 일정 API 컨트롤러
 */
@Tag(name = "Schedule API", description = "경기 일정 데이터 관리 API")
@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
public class ScheduleController {

    private final ScheduleService scheduleService;

    @Operation(summary = "일정 데이터 생성", description = "새로운 경기 일정 데이터를 생성합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "생성 성공"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청")
    })
    @PostMapping
    public Messenger<ScheduleDTO> create(
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "생성할 일정 데이터", required = true)
            @RequestBody ScheduleDTO dto) {
        ScheduleDTO response = scheduleService.create(dto);
        return Messenger.created("일정 데이터가 생성되었습니다.", response);
    }

    @Operation(summary = "일정 데이터 조회", description = "ID로 특정 일정 데이터를 조회합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @GetMapping("/{id}")
    public Messenger<ScheduleDTO> getById(
            @Parameter(description = "조회할 일정 ID", required = true)
            @PathVariable Long id) {
        ScheduleDTO response = scheduleService.getById(id);
        return Messenger.ok(response);
    }

    @Operation(summary = "일정 데이터 목록 조회",
               description = "모든 일정 데이터를 조회하거나 날짜/팀/구분으로 검색합니다.")
    @ApiResponse(responseCode = "200", description = "조회 성공")
    @GetMapping
    public Messenger<List<ScheduleDTO>> getAll(
            @Parameter(description = "검색할 날짜 (선택, YYYYMMDD)", required = false)
            @RequestParam(required = false) String date,
            @Parameter(description = "검색할 팀 고유키 (선택)", required = false)
            @RequestParam(required = false) String teamUk,
            @Parameter(description = "경기 구분 (선택)", required = false)
            @RequestParam(required = false) String gubun) {
        List<ScheduleDTO> responses;

        if (date != null) {
            responses = scheduleService.getByDate(date);
        } else if (teamUk != null) {
            responses = scheduleService.getByTeam(teamUk);
        } else if (gubun != null) {
            responses = scheduleService.getByGubun(gubun);
        } else {
            responses = scheduleService.getAll();
        }

        return Messenger.ok(responses);
    }

    @Operation(summary = "일정 데이터 수정", description = "기존 일정 데이터를 수정합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "수정 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @PutMapping("/{id}")
    public Messenger<ScheduleDTO> update(
            @Parameter(description = "수정할 일정 ID", required = true)
            @PathVariable Long id,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "수정할 일정 데이터", required = true)
            @RequestBody ScheduleDTO dto) {
        ScheduleDTO response = scheduleService.update(id, dto);
        return Messenger.ok("일정 데이터가 수정되었습니다.", response);
    }

    @Operation(summary = "일정 데이터 삭제", description = "ID로 특정 일정 데이터를 삭제합니다.")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "삭제 성공"),
            @ApiResponse(responseCode = "404", description = "데이터 없음")
    })
    @DeleteMapping("/{id}")
    public Messenger<Void> delete(
            @Parameter(description = "삭제할 일정 ID", required = true)
            @PathVariable Long id) {
        scheduleService.delete(id);
        return Messenger.noContent("일정 데이터가 삭제되었습니다.");
    }
}

