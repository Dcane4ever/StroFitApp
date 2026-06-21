package com.strofit.backend.recipe.repository;

import com.strofit.backend.recipe.entity.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, UUID> {

    List<RecipeIngredient> findByRecipeIdOrderByIngredientOrderAscCreatedAtAsc(UUID recipeId);
}
