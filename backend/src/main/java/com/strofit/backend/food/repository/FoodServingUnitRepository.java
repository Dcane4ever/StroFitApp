package com.strofit.backend.food.repository;

import com.strofit.backend.food.entity.FoodServingUnit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FoodServingUnitRepository extends JpaRepository<FoodServingUnit, UUID> {

    List<FoodServingUnit> findByFoodItemIdOrderBySortOrderAsc(UUID foodItemId);

    Optional<FoodServingUnit> findByFoodItemIdAndDefaultUnitTrue(UUID foodItemId);
}
