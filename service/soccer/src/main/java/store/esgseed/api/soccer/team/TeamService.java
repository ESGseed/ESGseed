package store.esgseed.api.soccer.team;

import java.util.List;

public interface TeamService {

    TeamModel create(TeamModel dto);

    TeamModel getById(Long id);

    List<TeamModel> getAll();

    List<TeamModel> searchByName(String teamName);

    List<TeamModel> getByRegion(String regionName);

    TeamModel update(Long id, TeamModel dto);

    void delete(Long id);
}

