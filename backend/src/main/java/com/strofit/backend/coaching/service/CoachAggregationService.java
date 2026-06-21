package com.strofit.backend.coaching.service;

import com.strofit.backend.coaching.dto.TraineeSummaryResponse;
import com.strofit.backend.diary.entity.DiaryEntryItem;
import com.strofit.backend.diary.repository.DiaryEntryItemRepository;
import com.strofit.backend.diary.repository.DiaryEntryRepository;
import com.strofit.backend.goal.UserGoalRepository;
import com.strofit.backend.profile.UserProfile;
import com.strofit.backend.profile.UserProfileRepository;
import com.strofit.backend.user.User;
import com.strofit.backend.weight.entity.WeightLog;
import com.strofit.backend.weight.repository.WeightLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CoachAggregationService {

    private static final int LOOKBACK_DAYS = 30;
    private static final int WEIGHT_CHANGE_SHORT_DAYS = 7;

    private final WeightLogRepository weightLogRepository;
    private final DiaryEntryItemRepository diaryItemRepository;
    private final DiaryEntryRepository diaryEntryRepository;
    private final UserProfileRepository userProfileRepository;
    private final UserGoalRepository goalRepository;

    @Transactional(readOnly = true)
    public TraineeSummaryResponse buildSummary(User trainee) {
        UUID traineeId = trainee.getId();
        LocalDate today = LocalDate.now();
        LocalDate start30d = today.minusDays(LOOKBACK_DAYS);
        LocalDate start7d  = today.minusDays(WEIGHT_CHANGE_SHORT_DAYS);

        // ---- Profile ----
        UserProfile profile = userProfileRepository.findByUserId(traineeId).orElse(null);
        String displayName = profile != null ? profile.getDisplayName() : trainee.getEmail();

        // ---- Weight ----
        Optional<WeightLog> latestLog = weightLogRepository.findTopByUserIdOrderByLoggedAtDesc(traineeId);
        BigDecimal latestWeight = latestLog.map(WeightLog::getWeightValue).orElse(null);
        String weightUnit = latestLog.map(l -> l.getWeightUnit().name()).orElse(null);

        BigDecimal weightChange7d  = computeWeightChange(traineeId, start7d, today);
        BigDecimal weightChange30d = computeWeightChange(traineeId, start30d, today);

        // ---- Nutrition averages (30d) ----
        List<DiaryEntryItem> items30d = diaryItemRepository.findByUserIdInRange(traineeId, start30d, today);

        Set<LocalDate> distinctLoggedDates = items30d.stream()
                .map(i -> i.getDiaryEntry().getEntryDate())
                .collect(Collectors.toSet());
        int loggedDays = distinctLoggedDates.size();

        BigDecimal avgCalories = averageOver(items30d, loggedDays, DiaryEntryItem::getCalories);
        BigDecimal avgProtein  = averageOver(items30d, loggedDays, DiaryEntryItem::getProteinG);
        BigDecimal avgCarbs    = averageOver(items30d, loggedDays, DiaryEntryItem::getCarbsG);
        BigDecimal avgFat      = averageOver(items30d, loggedDays, DiaryEntryItem::getFatG);

        // ---- Budget (30d) ----
        BigDecimal dailyBudgetLimit = goalRepository.findByUserIdAndActiveTrue(traineeId)
                .map(g -> g.getDailyBudgetPhp()).orElse(null);

        BigDecimal avgDailySpend = loggedDays > 0
                ? sumField(items30d, DiaryEntryItem::getPriceAmount)
                        .divide(BigDecimal.valueOf(loggedDays), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        BigDecimal avgBudgetUsagePct = null;
        if (dailyBudgetLimit != null && dailyBudgetLimit.compareTo(BigDecimal.ZERO) > 0) {
            avgBudgetUsagePct = avgDailySpend
                    .divide(dailyBudgetLimit, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(2, RoundingMode.HALF_UP);
        }

        // ---- Last logged date + streak ----
        LocalDate lastLoggedDate = distinctLoggedDates.stream()
                .max(LocalDate::compareTo)
                .orElse(null);

        int streak = computeStreak(traineeId, today);

        return TraineeSummaryResponse.builder()
                .traineeUserId(traineeId)
                .displayName(displayName)
                .email(trainee.getEmail())
                .latestWeightKg(latestWeight)
                .latestWeightUnit(weightUnit)
                .latestWeightLoggedAt(latestLog.map(WeightLog::getLoggedAt).orElse(null))
                .weightChange7d(weightChange7d)
                .weightChange30d(weightChange30d)
                .avgCaloriesPerDay(avgCalories)
                .avgProteinGPerDay(avgProtein)
                .avgCarbsGPerDay(avgCarbs)
                .avgFatGPerDay(avgFat)
                .loggedDaysLast30(loggedDays)
                .avgDailyBudgetLimit(dailyBudgetLimit)
                .avgDailySpend(avgDailySpend)
                .avgBudgetUsagePercent(avgBudgetUsagePct)
                .lastLoggedDate(lastLoggedDate)
                .currentStreak(streak)
                .build();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private BigDecimal computeWeightChange(UUID userId, LocalDate start, LocalDate end) {
        List<WeightLog> logs = weightLogRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(
                        userId,
                        start.atStartOfDay(ZoneOffset.UTC).toInstant(),
                        end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant());
        if (logs.size() < 2) return null;
        return logs.getLast().getWeightValue()
                .subtract(logs.getFirst().getWeightValue())
                .setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal averageOver(List<DiaryEntryItem> items, int days,
                                   Function<DiaryEntryItem, BigDecimal> getter) {
        if (days == 0) return BigDecimal.ZERO;
        return sumField(items, getter).divide(BigDecimal.valueOf(days), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal sumField(List<DiaryEntryItem> items,
                                Function<DiaryEntryItem, BigDecimal> getter) {
        return items.stream()
                .map(getter)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private int computeStreak(UUID userId, LocalDate asOf) {
        List<LocalDate> loggedDates = diaryEntryRepository.findLoggedDatesSince(userId, asOf);
        if (loggedDates.isEmpty()) return 0;

        int streak = 0;
        LocalDate expected = asOf;
        for (LocalDate date : loggedDates) {
            if (date.equals(expected)) {
                streak++;
                expected = expected.minusDays(1);
            } else if (date.isBefore(expected)) {
                break;
            }
        }
        return streak;
    }
}
