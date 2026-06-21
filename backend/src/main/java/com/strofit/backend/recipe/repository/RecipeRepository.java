package com.strofit.backend.recipe.repository;

import com.strofit.backend.recipe.entity.Recipe;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecipeRepository extends JpaRepository<Recipe, UUID> {

    List<Recipe> findByUserIdOrderByUpdatedAtDesc(UUID userId);
}
