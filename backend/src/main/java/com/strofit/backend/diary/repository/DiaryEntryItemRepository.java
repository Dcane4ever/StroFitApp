package com.strofit.backend.diary.repository;

import com.strofit.backend.diary.entity.DiaryEntryItem;
import com.strofit.backend.diary.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DiaryEntryItemRepository extends JpaRepository<DiaryEntryItem, UUID> {

    List<DiaryEntryItem> findByDiaryEntryIdOrderByLoggedAtAsc(UUID diaryEntryId);

    List<DiaryEntryItem> findByDiaryEntryIdAndMealTypeOrderByLoggedAtAsc(UUID diaryEntryId, MealType mealType);
}
