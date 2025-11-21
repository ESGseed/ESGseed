package site.esgseed.api.esg.checklist;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long>, ChecklistItemRepositoryCustom {

    Optional<ChecklistItem> findByCode(String code);

    List<ChecklistItem> findByCategory(String category);

    List<ChecklistItem> findByStatus(String status);

}

