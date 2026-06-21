package com.strofit.backend.mealplan.entity;

import com.strofit.backend.diary.enums.MealType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "meal_plan_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "meal_plan_id", nullable = false)
    private MealPlan mealPlan;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    @Column(name = "food_item_id")
    private UUID foodItemId;

    @Column(name = "recipe_id")
    private UUID recipeId;

    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    @Column(name = "serving_unit_id")
    private UUID servingUnitId;

    @Column(name = "serving_unit_label", length = 50)
    private String servingUnitLabel;

    @Column(name = "planned_calories", precision = 10, scale = 2)
    private BigDecimal plannedCalories;

    @Column(name = "planned_protein_g", precision = 10, scale = 2)
    private BigDecimal plannedProteinG;

    @Column(name = "planned_carbs_g", precision = 10, scale = 2)
    private BigDecimal plannedCarbsG;

    @Column(name = "planned_fat_g", precision = 10, scale = 2)
    private BigDecimal plannedFatG;

    @Column(name = "planned_fiber_g", precision = 10, scale = 2)
    private BigDecimal plannedFiberG;

    @Column(name = "estimated_cost_php", precision = 10, scale = 2)
    private BigDecimal estimatedCostPhp;

    @Column(name = "item_name_snapshot", length = 255)
    private String itemNameSnapshot;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
