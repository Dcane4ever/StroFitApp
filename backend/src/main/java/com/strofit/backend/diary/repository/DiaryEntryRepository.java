package com.strofit.backend.diary.repository;

import com.strofit.backend.diary.entity.DiaryEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DiaryEntryRepository extends JpaRepository<DiaryEntry, UUID> {

    Optional<DiaryEntry> findByUserIdAndEntryDate(UUID userId, LocalDate entryDate);

    // Returns dates that have at least one diary entry, sorted descending — used for streak calculation
    @Query("SELECT d.entryDate FROM DiaryEntry d WHERE d.userId = :userId AND d.entryDate <= :asOf ORDER BY d.entryDate DESC")
    List<LocalDate> findLoggedDatesSince(@Param("userId") UUID userId, @Param("asOf") LocalDate asOf);
}
