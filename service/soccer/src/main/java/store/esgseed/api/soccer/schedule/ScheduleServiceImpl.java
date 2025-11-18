package store.esgseed.api.soccer.schedule;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.Stream;

/**
 * 일정 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Override
    @Transactional
    public ScheduleDTO create(ScheduleDTO dto) {
        Schedule entity = Schedule.builder()
                .stadiumUk(dto.getStadiumUk())
                .scheDate(dto.getScheDate())
                .gubun(dto.getGubun())
                .hometeamUk(dto.getHomeTeamUk())
                .awayteamUk(dto.getAwayTeamUk())
                .homeScore(dto.getHomeScore())
                .awayScore(dto.getAwayScore())
                .build();

        Schedule saved = scheduleRepository.save(entity);
        return convertToDTO(saved);
    }

    @Override
    public ScheduleDTO getById(Long id) {
        Schedule entity = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("일정 데이터를 찾을 수 없습니다. ID: " + id));
        return convertToDTO(entity);
    }

    @Override
    public List<ScheduleDTO> getAll() {
        return scheduleRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleDTO> getByDate(String scheDate) {
        return scheduleRepository.findByScheDate(scheDate).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleDTO> getByTeam(String teamUk) {
        List<Schedule> homeGames = scheduleRepository.findByHometeamUk(teamUk);
        List<Schedule> awayGames = scheduleRepository.findByAwayteamUk(teamUk);

        return Stream.concat(homeGames.stream(), awayGames.stream())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ScheduleDTO> getByGubun(String gubun) {
        return scheduleRepository.findByGubun(gubun).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ScheduleDTO update(Long id, ScheduleDTO dto) {
        Schedule entity = scheduleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("일정 데이터를 찾을 수 없습니다. ID: " + id));

        entity.setStadiumUk(dto.getStadiumUk());
        entity.setScheDate(dto.getScheDate());
        entity.setGubun(dto.getGubun());
        entity.setHometeamUk(dto.getHomeTeamUk());
        entity.setAwayteamUk(dto.getAwayTeamUk());
        entity.setHomeScore(dto.getHomeScore());
        entity.setAwayScore(dto.getAwayScore());

        return convertToDTO(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new IllegalArgumentException("일정 데이터를 찾을 수 없습니다. ID: " + id);
        }
        scheduleRepository.deleteById(id);
    }

    private ScheduleDTO convertToDTO(Schedule entity) {
        return ScheduleDTO.builder()
                .id(entity.getId())
                .stadiumUk(entity.getStadiumUk())
                .scheDate(entity.getScheDate())
                .gubun(entity.getGubun())
                .homeTeamUk(entity.getHometeamUk())
                .awayTeamUk(entity.getAwayteamUk())
                .homeScore(entity.getHomeScore())
                .awayScore(entity.getAwayScore())
                .build();
    }
}
