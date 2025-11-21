package site.esgseed.api.esg.checklist;

import java.util.List;

public interface ChecklistItemService {

    ChecklistItemModel create(ChecklistItemModel dto);

    ChecklistItemModel getById(Long id);

    List<ChecklistItemModel> getAll();

    List<ChecklistItemModel> getByCategory(String category);

    List<ChecklistItemModel> getByStatus(String status);

    ChecklistItemModel update(Long id, ChecklistItemModel dto);

    void delete(Long id);
}

