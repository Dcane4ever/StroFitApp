package com.strofit.backend.goal;

import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.goal.dto.UpdateGoalRequest;
import com.strofit.backend.goal.dto.UserGoalResponse;
import com.strofit.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserGoalService {

    private final UserGoalRepository goalRepository;

    @Transactional(readOnly = true)
    public UserGoalResponse getActiveGoal(UUID userId) {
        UserGoal goal = goalRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Active goal"));
        return UserGoalResponse.from(goal);
    }

    /**
     * Deactivates any existing active goal and creates a new one.
     * This is the correct MVP behavior: updating goal type/targets = new goal record.
     */
    @Transactional
    public UserGoalResponse upsertGoal(UUID userId, UpdateGoalRequest request, User user) {
        goalRepository.deactivateAllForUser(userId);

        UserGoal newGoal = UserGoal.builder()
                .user(user)
                .goalType(request.getGoalType())
                .calorieTarget(request.getCalorieTarget())
                .proteinTargetG(request.getProteinTargetG())
                .carbsTargetG(request.getCarbsTargetG())
                .fatsTargetG(request.getFatsTargetG())
                .fiberTargetG(request.getFiberTargetG())
                .dailyBudgetPhp(request.getDailyBudgetPhp())
                .active(true)
                .build();

        return UserGoalResponse.from(goalRepository.save(newGoal));
    }

    @Transactional
    public UserGoal createInitialGoal(User user, UpdateGoalRequest request) {
        UserGoal goal = UserGoal.builder()
                .user(user)
                .goalType(request.getGoalType())
                .calorieTarget(request.getCalorieTarget())
                .proteinTargetG(request.getProteinTargetG())
                .carbsTargetG(request.getCarbsTargetG())
                .fatsTargetG(request.getFatsTargetG())
                .fiberTargetG(request.getFiberTargetG())
                .dailyBudgetPhp(request.getDailyBudgetPhp())
                .active(true)
                .build();
        return goalRepository.save(goal);
    }
}
