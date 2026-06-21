package com.strofit.backend.food.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "food_nutrition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodNutrition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false, unique = true)
    private FoodItem foodItem;

    // All values per 100g — canonical storage unit
    @Column(name = "calories_per_100g", nullable = false, precision = 7, scale = 2)
    private BigDecimal caloriesPer100g;

    @Column(name = "protein_per_100g", precision = 6, scale = 2)
    private BigDecimal proteinPer100g;

    @Column(name = "carbs_per_100g", precision = 6, scale = 2)
    private BigDecimal carbsPer100g;

    @Column(name = "fat_per_100g", precision = 6, scale = 2)
    private BigDecimal fatPer100g;

    @Column(name = "fiber_per_100g", precision = 6, scale = 2)
    private BigDecimal fiberPer100g;

    @Column(name = "sugar_per_100g", precision = 6, scale = 2)
    private BigDecimal sugarPer100g;

    @Column(name = "sodium_per_100mg", precision = 7, scale = 2)
    private BigDecimal sodiumPer100mg;

    // Source serving reference — what the label declared
    @Column(name = "per_quantity", precision = 7, scale = 2)
    private BigDecimal perQuantity;

    @Column(name = "per_unit_label", length = 30)
    private String perUnitLabel;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
