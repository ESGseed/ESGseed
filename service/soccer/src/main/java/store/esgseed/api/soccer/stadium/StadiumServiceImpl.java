package store.esgseed.api.soccer.stadium;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 경기장 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StadiumServiceImpl implements StadiumService {

    private final StadiumRepository stadiumRepository;

    @Override
    @Transactional
    public StadiumModel create(StadiumModel dto) {
        Stadium entity = Stadium.builder()
                .stadiumUk(dto.getStadiumUk())
                .stadiumName(dto.getStadiumName())
                .hometeamUk(dto.getHomeTeamUk())
                .seatCount(dto.getSeatCount())
                .address(dto.getAddress())
                .ddd(dto.getDdd())
                .tel(dto.getTel())
                .build();

        Stadium saved = stadiumRepository.save(entity);
        return convertToDTO(saved);
    }

    @Override
    public StadiumModel getById(Long id) {
        Stadium entity = stadiumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("경기장 데이터를 찾을 수 없습니다. ID: " + id));
        return convertToDTO(entity);
    }

    @Override
    public List<StadiumModel> getAll() {
        return stadiumRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StadiumModel> searchByName(String stadiumName) {
        return stadiumRepository.findByStadiumNameContaining(stadiumName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<StadiumModel> getByHomeTeam(String homeTeamUk) {
        return stadiumRepository.findByHometeamUk(homeTeamUk).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public StadiumModel update(Long id, StadiumModel dto) {
        Stadium entity = stadiumRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("경기장 데이터를 찾을 수 없습니다. ID: " + id));

        entity.setStadiumUk(dto.getStadiumUk());
        entity.setStadiumName(dto.getStadiumName());
        entity.setHometeamUk(dto.getHomeTeamUk());
        entity.setSeatCount(dto.getSeatCount());
        entity.setAddress(dto.getAddress());
        entity.setDdd(dto.getDdd());
        entity.setTel(dto.getTel());

        return convertToDTO(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!stadiumRepository.existsById(id)) {
            throw new IllegalArgumentException("경기장 데이터를 찾을 수 없습니다. ID: " + id);
        }
        stadiumRepository.deleteById(id);
    }

    private StadiumModel convertToDTO(Stadium entity) {
        return StadiumModel.builder()
                .stadiumId(entity.getId())
                .stadiumUk(entity.getStadiumUk())
                .stadiumName(entity.getStadiumName())
                .homeTeamUk(entity.getHometeamUk())
                .seatCount(entity.getSeatCount())
                .address(entity.getAddress())
                .ddd(entity.getDdd())
                .tel(entity.getTel())
                .build();
    }
}
