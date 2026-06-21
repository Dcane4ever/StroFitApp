package com.strofit.backend.food.repository;

import com.strofit.backend.food.entity.BrandedProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandedProductRepository extends JpaRepository<BrandedProduct, UUID> {

    Optional<BrandedProduct> findByFoodItemId(UUID foodItemId);
}
