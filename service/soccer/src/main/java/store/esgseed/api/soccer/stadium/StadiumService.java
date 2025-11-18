package store.esgseed.api.soccer.stadium;

import java.util.List;

public interface StadiumService {

    StadiumModel create(StadiumModel dto);

    StadiumModel getById(Long id);

    List<StadiumModel> getAll();

    List<StadiumModel> searchByName(String stadiumName);

    List<StadiumModel> getByHomeTeam(String homeTeamUk);

    StadiumModel update(Long id, StadiumModel dto);

    void delete(Long id);
}

