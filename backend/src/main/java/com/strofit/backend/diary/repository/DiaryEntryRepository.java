package com.strofit.backend.diary.repository;

import com.strofit.backend.diary.entity.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, UUID> {

    Optional<DiaryEntry> findByUserIdAndEntryDate(UUID userId, LocalDate entryDate);
}
