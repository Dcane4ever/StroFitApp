package com.strofit.backend.goal.dto;

import com.strofit.backend.goal.GoalType;
import com.strofit.backend.goal.UserGoal;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class UserGoalResponse {

    private UUID id;
    private UUID userId;
    private GoalType goalType;
    private int calorieTarget;
    private BigDecimal proteinTargetG;
    private BigDecimal carbsTargetG;
    private BigDecimal fatsTargetG;
    private BigDecimal fiberTargetG;
    private BigDecimal dailyBudgetPhp;
    private boolean active;
    private LocalDate startsOn;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static UserGoalResponse from(UserGoal goal) {
        return UserGoalResponse.builder()
                .id(goal.getId())
                .userId(goal.getUser().getId())
                .goalType(goal.getGoalType())
                .calorieTarget(goal.getCalorieTarget())
                .proteinTargetG(goal.getProteinTargetG())
                .carbsTargetG(goal.getCarbsTargetG())
                .fatsTargetG(goal.getFatsTargetG())
                .fiberTargetG(goal.getFiberTargetG())
                .dailyBudgetPhp(goal.getDailyBudgetPhp())
                .active(goal.isActive())
                .startsOn(goal.getStartsOn())
                .createdAt(goal.getCreatedAt())
                .updatedAt(goal.getUpdatedAt())
                .build();
    }
}
