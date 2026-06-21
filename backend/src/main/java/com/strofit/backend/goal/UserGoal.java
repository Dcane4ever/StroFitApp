package com.strofit.backend.goal;

import com.strofit.backend.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_goals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserGoal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "goal_type", nullable = false, length = 20)
    private GoalType goalType;

    @Column(name = "calorie_target", nullable = false)
    private int calorieTarget;

    @Column(name = "protein_target_g", nullable = false, precision = 6, scale = 1)
    private BigDecimal proteinTargetG;

    @Column(name = "carbs_target_g", nullable = false, precision = 6, scale = 1)
    private BigDecimal carbsTargetG;

    @Column(name = "fats_target_g", nullable = false, precision = 6, scale = 1)
    private BigDecimal fatsTargetG;

    @Column(name = "fiber_target_g", precision = 6, scale = 1)
    private BigDecimal fiberTargetG;

    @Column(name = "daily_budget_php", precision = 8, scale = 2)
    private BigDecimal dailyBudgetPhp;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "starts_on", nullable = false)
    @Builder.Default
    private LocalDate startsOn = LocalDate.now();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
