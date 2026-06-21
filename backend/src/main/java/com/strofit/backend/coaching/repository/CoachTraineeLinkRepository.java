package com.strofit.backend.coaching.repository;

import com.strofit.backend.coaching.entity.CoachTraineeLink;
import com.strofit.backend.coaching.enums.LinkStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CoachTraineeLinkRepository extends JpaRepository<CoachTraineeLink, UUID> {

    // Coach view: all trainees (any status)
    List<CoachTraineeLink> findByCoachUserIdOrderByCreatedAtDesc(UUID coachUserId);

    // Coach view: active trainees only
    List<CoachTraineeLink> findByCoachUserIdAndStatus(UUID coachUserId, LinkStatus status);

    // Trainee view: their link(s) — normally one active at most
    List<CoachTraineeLink> findByTraineeUserIdOrderByCreatedAtDesc(UUID traineeUserId);

    // Find specific link between coach and trainee
    Optional<CoachTraineeLink> findByCoachUserIdAndTraineeUserId(UUID coachUserId, UUID traineeUserId);

    // Check if trainee already has an active coach
    Optional<CoachTraineeLink> findByTraineeUserIdAndStatus(UUID traineeUserId, LinkStatus status);

    // Trainee looks up a specific invite (pending link by id they own)
    Optional<CoachTraineeLink> findByIdAndTraineeUserId(UUID id, UUID traineeUserId);
}
