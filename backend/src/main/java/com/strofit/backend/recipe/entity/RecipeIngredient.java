package com.strofit.backend.recipe.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recipe_ingredients")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecipeIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Column(name = "food_item_id", nullable = false)
    private UUID foodItemId;

    @Column(name = "branded_product_id")
    private UUID brandedProductId;

    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    @Column(name = "serving_unit_id", nullable = false)
    private UUID servingUnitId;

    @Column(name = "ingredient_order")
    private Integer ingredientOrder;

    @Column(name = "ingredient_note", length = 500)
    private String ingredientNote;

    @Column(name = "food_name_snapshot", nullable = false, length = 255)
    private String foodNameSnapshot;

    @Column(name = "brand_name_snapshot", length = 255)
    private String brandNameSnapshot;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
