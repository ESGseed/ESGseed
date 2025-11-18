package store.esgseed.api.soccer.stadium;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StadiumRepository extends JpaRepository<Stadium, Long> {

    List<Stadium> findByStadiumNameContaining(String stadiumName);

    List<Stadium> findByHometeamUk(String hometeamUk);
}
