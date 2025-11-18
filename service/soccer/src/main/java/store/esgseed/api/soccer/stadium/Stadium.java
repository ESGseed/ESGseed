package store.esgseed.api.soccer.stadium;

import jakarta.persistence.*;
import lombok.*;

/**
 * 경기장 엔티티 - 데이터베이스 테이블과 매핑
 */
@Entity
@Table(name = "stadiums")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Stadium {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String stadiumUk; // Stadium의 uk
    private String stadiumName;
    private String hometeamUk; // FK 아님, 정보용
    private String seatCount;
    private String address;
    private String ddd;
    private String tel;
}
