package com.strofit.backend.food.repository;

import com.strofit.backend.food.entity.FoodNutrition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Repository
public interface FoodNutritionRepository extends JpaRepository<FoodNutrition, UUID> {

    Optional<FoodNutrition> findByFoodItemId(UUID foodItemId);

    List<FoodNutrition> findAllByFoodItemIdIn(Set<UUID> foodItemIds);
}
