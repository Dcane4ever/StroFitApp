package com.strofit.backend.mealplan.repository;

import com.strofit.backend.mealplan.entity.MealPlanItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MealPlanItemRepository extends JpaRepository<MealPlanItem, UUID> {

    List<MealPlanItem> findByMealPlanIdOrderByMealTypeAscSortOrderAsc(UUID mealPlanId);
}
