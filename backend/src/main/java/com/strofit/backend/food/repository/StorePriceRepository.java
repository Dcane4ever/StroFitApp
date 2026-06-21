package com.strofit.backend.food.repository;

import com.strofit.backend.food.entity.StorePrice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StorePriceRepository extends JpaRepository<StorePrice, UUID> {

    List<StorePrice> findByFoodItemIdAndActiveTrue(UUID foodItemId);

    List<StorePrice> findByBrandedProductIdAndActiveTrue(UUID brandedProductId);
}
