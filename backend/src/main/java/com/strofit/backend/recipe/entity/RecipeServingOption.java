package com.strofit.backend.recipe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recipe_serving_options")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeServingOption {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "label", nullable = false, length = 100)
    private String label;

    // How many of "label" this option represents (e.g. quantity=2, label="slices")
    @Column(name = "quantity", nullable = false, precision = 8, scale = 3)
    private BigDecimal quantity;

    // If set: cross-serving nutrition computed as (grams_equivalent / recipe_total_grams) * recipe_total
    @Column(name = "grams_equivalent", precision = 10, scale = 2)
    private BigDecimal gramsEquivalent;

    // If set: nutrition computed as this fraction of recipe total (e.g. 0.25 = 1/4 recipe)
    @Column(name = "fraction_of_recipe", precision = 12, scale = 8)
    private BigDecimal fractionOfRecipe;

    @Column(name = "is_default", nullable = false)
    private boolean defaultOption;

    @Column(name = "display_order")
    private Integer displayOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
