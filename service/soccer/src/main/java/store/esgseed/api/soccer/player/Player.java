package store.esgseed.api.soccer.player;

import jakarta.persistence.*;
import lombok.*;
import store.esgseed.api.soccer.team.Team;

/**
 * 선수 엔티티 - 데이터베이스 테이블과 매핑
 */
@Entity
@Table(name = "players")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Player {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String playerUk;
    private String playerName;
    private String teamUk;
    private String ePlayerName;
    private String nickname;
    private String joinYyyy;
    private String position;
    private String backNo;
    private String nation;
    private String birthDate;
    private String solar;
    private String height;
    private String weight;

    // Team과의 다대일 연관관계 (Team이 부모)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    private Team team;
}
