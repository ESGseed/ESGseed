package site.esgseed.api.esg.checklist;

import jakarta.persistence.*;
import lombok.*;

/**
 * 체크리스트 항목 엔티티 - 데이터베이스 테이블과 매핑
 */
@Entity
@Table(name = "checklist_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String code; // 예: "S2-7"

    @Column(nullable = false)
    private String title; // 체크리스트 제목

    private String description; // 설명

    @Column(nullable = false)
    private String status; // 상태: "pending", "completed", "in_progress"

    private String category; // 카테고리: "S2", "G1", "E3" 등
}
