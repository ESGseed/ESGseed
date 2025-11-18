package store.esgseed.api.soccer.player;

import java.util.List;

public interface PlayerService {

    PlayerModel create(PlayerModel dto);

    PlayerModel getById(Long id);

    List<PlayerModel> getAll();

    List<PlayerModel> searchByName(String playerName);

    List<PlayerModel> getByPosition(String position);

    PlayerModel update(Long id, PlayerModel dto);

    void delete(Long id);
}

