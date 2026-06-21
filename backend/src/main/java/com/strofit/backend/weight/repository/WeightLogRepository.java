package com.strofit.backend.weight.repository;

import com.strofit.backend.weight.entity.WeightLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WeightLogRepository extends JpaRepository<WeightLog, UUID> {

    List<WeightLog> findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(
            UUID userId, Instant start, Instant end);

    // Most recent log overall — used for profile auto-sync
    Optional<WeightLog> findTopByUserIdOrderByLoggedAtDesc(UUID userId);

    // Most recent log before a given instant — used for rollback after delete
    @Query("SELECT w FROM WeightLog w WHERE w.userId = :userId AND w.loggedAt < :before ORDER BY w.loggedAt DESC LIMIT 1")
    Optional<WeightLog> findLatestBefore(@Param("userId") UUID userId, @Param("before") Instant before);

    long countByUserIdAndLoggedAtBetween(UUID userId, Instant start, Instant end);

    @Query("SELECT AVG(w.weightValue) FROM WeightLog w WHERE w.userId = :userId AND w.loggedAt BETWEEN :start AND :end")
    Optional<java.math.BigDecimal> avgWeightInRange(
            @Param("userId") UUID userId,
            @Param("start") Instant start,
            @Param("end") Instant end);
}
