package store.esgseed.api.soccer.schedule;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    
    List<Schedule> findByScheDate(String scheDate);
    
    List<Schedule> findByHometeamUk(String hometeamUk);
    
    List<Schedule> findByAwayteamUk(String awayteamUk);
    
    List<Schedule> findByGubun(String gubun);
}

