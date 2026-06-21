package com.strofit.backend.mealplan.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "meal_plans")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "plan_date", nullable = false)
    private LocalDate planDate;

    @Column(name = "target_calories", precision = 8, scale = 2)
    private BigDecimal targetCalories;

    @Column(name = "target_protein_g", precision = 7, scale = 2)
    private BigDecimal targetProteinG;

    @Column(name = "target_carbs_g", precision = 7, scale = 2)
    private BigDecimal targetCarbsG;

    @Column(name = "target_fat_g", precision = 7, scale = 2)
    private BigDecimal targetFatG;

    @Column(name = "budget_limit_php", precision = 10, scale = 2)
    private BigDecimal budgetLimitPhp;

    @Column(name = "notes")
    private String notes;

    @OneToMany(mappedBy = "mealPlan", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("mealType ASC, sortOrder ASC NULLS LAST")
    @Builder.Default
    private List<MealPlanItem> items = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
