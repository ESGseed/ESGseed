package store.esgseed.api.soccer.player;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 선수 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PlayerServiceImpl implements PlayerService {

    private final PlayerRepository playerRepository;

    @Override
    @Transactional
    public PlayerModel create(PlayerModel dto) {
        Player entity = Player.builder()
                .playerUk(dto.getPlayerUk())
                .teamUk(dto.getTeamUk())
                .playerName(dto.getPlayerName())
                .ePlayerName(dto.getEPlayerName())
                .nickname(dto.getNickname())
                .joinYyyy(dto.getJoinYyyy())
                .position(dto.getPosition())
                .backNo(dto.getBackNo())
                .nation(dto.getNation())
                .birthDate(dto.getBirthDate())
                .solar(dto.getSolar())
                .height(dto.getHeight())
                .weight(dto.getWeight())
                .build();

        Player saved = playerRepository.save(entity);
        return convertToDTO(saved);
    }

    @Override
    public PlayerModel getById(Long id) {
        Player entity = playerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("선수 데이터를 찾을 수 없습니다. ID: " + id));
        return convertToDTO(entity);
    }

    @Override
    public List<PlayerModel> getAll() {
        return playerRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlayerModel> searchByName(String playerName) {
        return playerRepository.findByPlayerNameContaining(playerName).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<PlayerModel> getByPosition(String position) {
        return playerRepository.findByPosition(position).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PlayerModel update(Long id, PlayerModel dto) {
        Player entity = playerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("선수 데이터를 찾을 수 없습니다. ID: " + id));

        entity.setPlayerUk(dto.getPlayerUk());
        entity.setTeamUk(dto.getTeamUk());
        entity.setPlayerName(dto.getPlayerName());
        entity.setEPlayerName(dto.getEPlayerName());
        entity.setNickname(dto.getNickname());
        entity.setJoinYyyy(dto.getJoinYyyy());
        entity.setPosition(dto.getPosition());
        entity.setBackNo(dto.getBackNo());
        entity.setNation(dto.getNation());
        entity.setBirthDate(dto.getBirthDate());
        entity.setSolar(dto.getSolar());
        entity.setHeight(dto.getHeight());
        entity.setWeight(dto.getWeight());

        return convertToDTO(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!playerRepository.existsById(id)) {
            throw new IllegalArgumentException("선수 데이터를 찾을 수 없습니다. ID: " + id);
        }
        playerRepository.deleteById(id);
    }

    private PlayerModel convertToDTO(Player entity) {
        return PlayerModel.builder()
                .playerId(entity.getId())
                .playerUk(entity.getPlayerUk())
                .teamUk(entity.getTeamUk())
                .playerName(entity.getPlayerName())
                .ePlayerName(entity.getEPlayerName())
                .nickname(entity.getNickname())
                .joinYyyy(entity.getJoinYyyy())
                .position(entity.getPosition())
                .backNo(entity.getBackNo())
                .nation(entity.getNation())
                .birthDate(entity.getBirthDate())
                .solar(entity.getSolar())
                .height(entity.getHeight())
                .weight(entity.getWeight())
                .build();
    }
}
