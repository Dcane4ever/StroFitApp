package com.strofit.backend.food.repository;

import com.strofit.backend.food.entity.FoodItem;
import com.strofit.backend.food.enums.FoodType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FoodItemRepository extends JpaRepository<FoodItem, UUID> {

    // Full-text search on name using the generated tsvector column.
    // Also searches aliases via a subquery join.
    // Results ordered by: verified first, then by ts_rank descending.
    @Query(value = """
            SELECT DISTINCT f.*
            FROM food_items f
            LEFT JOIN food_aliases a ON a.food_item_id = f.id
            WHERE f.is_public = true
              AND (
                  f.search_vector @@ plainto_tsquery('english', :query)
                  OR a.alias_search_vector @@ plainto_tsquery('english', :query)
                  OR f.name ILIKE '%' || :query || '%'
              )
            ORDER BY f.is_verified DESC,
                     ts_rank(f.search_vector, plainto_tsquery('english', :query)) DESC
            LIMIT :limit OFFSET :offset
            """,
            nativeQuery = true)
    List<FoodItem> searchByNameOrAlias(
            @Param("query") String query,
            @Param("limit") int limit,
            @Param("offset") int offset);

    // Count for pagination
    @Query(value = """
            SELECT COUNT(DISTINCT f.id)
            FROM food_items f
            LEFT JOIN food_aliases a ON a.food_item_id = f.id
            WHERE f.is_public = true
              AND (
                  f.search_vector @@ plainto_tsquery('english', :query)
                  OR a.alias_search_vector @@ plainto_tsquery('english', :query)
                  OR f.name ILIKE '%' || :query || '%'
              )
            """,
            nativeQuery = true)
    long countSearchResults(@Param("query") String query);

    // User's own custom foods — includes private entries
    List<FoodItem> findByCreatedByUserIdAndFoodType(UUID userId, FoodType foodType);

    // Find public foods by category
    List<FoodItem> findByIsPublicTrueAndCategory(String category, Pageable pageable);
}
