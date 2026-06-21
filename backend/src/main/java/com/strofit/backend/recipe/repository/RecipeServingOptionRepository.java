package com.strofit.backend.recipe.repository;

import com.strofit.backend.recipe.entity.RecipeServingOption;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RecipeServingOptionRepository extends JpaRepository<RecipeServingOption, UUID> {

    List<RecipeServingOption> findByRecipeIdOrderByDisplayOrderAscCreatedAtAsc(UUID recipeId);

    Optional<RecipeServingOption> findByRecipeIdAndDefaultOptionTrue(UUID recipeId);
}
