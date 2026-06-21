package com.strofit.backend.mealplan.repository;

import com.strofit.backend.mealplan.entity.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface MealPlanRepository extends JpaRepository<MealPlan, UUID> {

    Optional<MealPlan> findByUserIdAndPlanDate(UUID userId, LocalDate planDate);
}
