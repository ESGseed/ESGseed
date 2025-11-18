package store.esgseed.api.soccer.schedule;

import jakarta.persistence.*;
import lombok.*;
import store.esgseed.api.soccer.stadium.Stadium;

/**
 * 일정 엔티티 - 데이터베이스 테이블과 매핑
 */
@Entity
@Table(name = "schedules")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Schedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String stadiumUk; // Schedule의 uk
    private String scheDate;
    private String gubun;
    private String hometeamUk;
    private String awayteamUk;
    private String homeScore;
    private String awayScore;

    // Stadium과의 다대일 연관관계 (Stadium이 부모)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stadium_id")
    private Stadium stadium;

}
