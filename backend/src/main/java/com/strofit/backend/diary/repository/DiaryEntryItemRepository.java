package com.strofit.backend.diary.repository;

import com.strofit.backend.diary.entity.DiaryEntryItem;
import com.strofit.backend.diary.enums.MealType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DiaryEntryItemRepository extends JpaRepository<DiaryEntryItem, UUID> {

    List<DiaryEntryItem> findByDiaryEntryIdOrderByLoggedAtAsc(UUID diaryEntryId);

    List<DiaryEntryItem> findByDiaryEntryIdAndMealTypeOrderByLoggedAtAsc(UUID diaryEntryId, MealType mealType);

    @Query("SELECT i FROM DiaryEntryItem i WHERE i.diaryEntry.userId = :userId AND i.diaryEntry.entryDate = :date")
    List<DiaryEntryItem> findByUserIdAndDate(@Param("userId") UUID userId, @Param("date") LocalDate date);

    @Query("SELECT i FROM DiaryEntryItem i WHERE i.diaryEntry.userId = :userId " +
           "AND i.diaryEntry.entryDate >= :start AND i.diaryEntry.entryDate <= :end")
    List<DiaryEntryItem> findByUserIdInRange(@Param("userId") UUID userId,
                                             @Param("start") LocalDate start,
                                             @Param("end") LocalDate end);
}
