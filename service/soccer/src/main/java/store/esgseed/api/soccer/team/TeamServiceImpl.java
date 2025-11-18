package store.esgseed.api.soccer.team;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 팀 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TeamServiceImpl implements TeamService {

    private final TeamRepository teamRepository;

    @Override
    @Transactional
    public TeamModel create(TeamModel dto) {
        Team entity = Team.builder()
                .teamUk(dto.getTeamUk())
                .regionName(dto.getRegionName())
                .teamName(dto.getTeamName())
                .eTeamName(dto.getETeamName())
                .origYyyy(dto.getOrigYyyy())
                .zipCode1(dto.getZipCode1())
                .zipCode2(dto.getZipCode2())
                .address(dto.getAddress())
                .ddd(dto.getDdd())
                .tel(dto.getTel())
                .fax(dto.getFax())
                .homepage(dto.getHomepage())
                .owner(dto.getOwner())
                .build();

        Team saved = teamRepository.save(entity);
        return convertToDTO(saved);
    }

    @Override
    public TeamModel getById(Long id) {
        Team entity = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팀 데이터를 찾을 수 없습니다. ID: " + id));
        return convertToDTO(entity);
    }

    @Override
    public List<TeamModel> getAll() {
        return teamRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamModel> searchByName(String teamName) {
        return teamRepository.findByTeamNameContaining(teamName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<TeamModel> getByRegion(String regionName) {
        return teamRepository.findByRegionName(regionName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TeamModel update(Long id, TeamModel dto) {
        Team entity = teamRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("팀 데이터를 찾을 수 없습니다. ID: " + id));

        entity.setTeamUk(dto.getTeamUk());
        entity.setRegionName(dto.getRegionName());
        entity.setTeamName(dto.getTeamName());
        entity.setETeamName(dto.getETeamName());
        entity.setOrigYyyy(dto.getOrigYyyy());
        entity.setZipCode1(dto.getZipCode1());
        entity.setZipCode2(dto.getZipCode2());
        entity.setAddress(dto.getAddress());
        entity.setDdd(dto.getDdd());
        entity.setTel(dto.getTel());
        entity.setFax(dto.getFax());
        entity.setHomepage(dto.getHomepage());
        entity.setOwner(dto.getOwner());

        return convertToDTO(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!teamRepository.existsById(id)) {
            throw new IllegalArgumentException("팀 데이터를 찾을 수 없습니다. ID: " + id);
        }
        teamRepository.deleteById(id);
    }

    private TeamModel convertToDTO(Team entity) {
        return TeamModel.builder()
                .teamId(entity.getId())
                .teamUk(entity.getTeamUk())
                .regionName(entity.getRegionName())
                .teamName(entity.getTeamName())
                .eTeamName(entity.getETeamName())
                .origYyyy(entity.getOrigYyyy())
                .zipCode1(entity.getZipCode1())
                .zipCode2(entity.getZipCode2())
                .address(entity.getAddress())
                .ddd(entity.getDdd())
                .tel(entity.getTel())
                .fax(entity.getFax())
                .homepage(entity.getHomepage())
                .owner(entity.getOwner())
                .build();
    }
}

