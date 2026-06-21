package com.strofit.backend.goal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserGoalRepository extends JpaRepository<UserGoal, UUID> {

    Optional<UserGoal> findByUserIdAndActiveTrue(UUID userId);

    @Modifying
    @Query("UPDATE UserGoal g SET g.active = false WHERE g.user.id = :userId AND g.active = true")
    void deactivateAllForUser(UUID userId);
}
