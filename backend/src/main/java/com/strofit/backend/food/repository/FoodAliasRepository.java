package com.strofit.backend.food.repository;

import com.strofit.backend.food.entity.FoodAlias;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FoodAliasRepository extends JpaRepository<FoodAlias, UUID> {

    List<FoodAlias> findByFoodItemId(UUID foodItemId);
}
