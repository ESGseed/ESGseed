package site.esgseed.api.esg.checklist;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * 체크리스트 항목 서비스 구현체
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChecklistItemServiceImpl implements ChecklistItemService {

    private final ChecklistItemRepository checklistItemRepository;

    @Override
    @Transactional
    public ChecklistItemModel create(ChecklistItemModel dto) {
        ChecklistItem entity = ChecklistItem.builder()
                .code(dto.getCode())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status(dto.getStatus())
                .category(dto.getCategory())
                .build();

        ChecklistItem saved = checklistItemRepository.save(entity);
        return convertToDTO(saved);
    }

    @Override
    public ChecklistItemModel getById(Long id) {
        ChecklistItem entity = checklistItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("체크리스트 항목을 찾을 수 없습니다. ID: " + id));
        return convertToDTO(entity);
    }

    @Override
    public List<ChecklistItemModel> getAll() {
        return checklistItemRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChecklistItemModel> getByCategory(String category) {
        return checklistItemRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<ChecklistItemModel> getByStatus(String status) {
        return checklistItemRepository.findByStatus(status).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public ChecklistItemModel update(Long id, ChecklistItemModel dto) {
        ChecklistItem entity = checklistItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("체크리스트 항목을 찾을 수 없습니다. ID: " + id));

        entity.setCode(dto.getCode());
        entity.setTitle(dto.getTitle());
        entity.setDescription(dto.getDescription());
        entity.setStatus(dto.getStatus());
        entity.setCategory(dto.getCategory());

        return convertToDTO(entity);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!checklistItemRepository.existsById(id)) {
            throw new IllegalArgumentException("체크리스트 항목을 찾을 수 없습니다. ID: " + id);
        }
        checklistItemRepository.deleteById(id);
    }

    private ChecklistItemModel convertToDTO(ChecklistItem entity) {
        return ChecklistItemModel.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .status(entity.getStatus())
                .category(entity.getCategory())
                .build();
    }
}
