package com.strofit.backend.budget.service;

import com.strofit.backend.budget.dto.DailyBudgetSummaryResponse;
import com.strofit.backend.budget.dto.MealBudgetBreakdown;
import com.strofit.backend.budget.dto.WeeklyBudgetSummaryResponse;
import com.strofit.backend.diary.entity.DiaryEntryItem;
import com.strofit.backend.diary.enums.MealType;
import com.strofit.backend.diary.repository.DiaryEntryItemRepository;
import com.strofit.backend.goal.UserGoalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final DiaryEntryItemRepository diaryItemRepository;
    private final UserGoalRepository goalRepository;

    // -------------------------------------------------------------------------
    // GET /budget/daily?date=
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public DailyBudgetSummaryResponse getDailyBudget(UUID userId, LocalDate date) {
        BigDecimal budgetLimit = resolveBudgetLimit(userId);
        List<DiaryEntryItem> items = diaryItemRepository.findByUserIdAndDate(userId, date);
        return buildDailySummary(date, budgetLimit, items);
    }

    // -------------------------------------------------------------------------
    // GET /budget/range?start=&end=
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public WeeklyBudgetSummaryResponse getRangeBudget(UUID userId, LocalDate start, LocalDate end) {
        BigDecimal budgetLimit = resolveBudgetLimit(userId);

        List<DailyBudgetSummaryResponse> dailySummaries = new ArrayList<>();
        LocalDate current = start;
        while (!current.isAfter(end)) {
            List<DiaryEntryItem> items = diaryItemRepository.findByUserIdAndDate(userId, current);
            dailySummaries.add(buildDailySummary(current, budgetLimit, items));
            current = current.plusDays(1);
        }

        long totalDays = dailySummaries.size();
        BigDecimal totalBudgetLimit = budgetLimit != null
                ? budgetLimit.multiply(BigDecimal.valueOf(totalDays))
                : null;

        BigDecimal totalSpent = dailySummaries.stream()
                .map(DailyBudgetSummaryResponse::getTotalSpent)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalRemaining = totalBudgetLimit != null
                ? totalBudgetLimit.subtract(totalSpent).setScale(2, RoundingMode.HALF_UP)
                : null;

        BigDecimal avgDailySpend = totalDays > 0
                ? totalSpent.divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return WeeklyBudgetSummaryResponse.builder()
                .startDate(start)
                .endDate(end)
                .totalDays((int) totalDays)
                .totalBudgetLimit(totalBudgetLimit)
                .totalSpent(totalSpent)
                .totalRemaining(totalRemaining)
                .averageDailySpend(avgDailySpend)
                .averageDailyBudget(budgetLimit)
                .dailySummaries(dailySummaries)
                .build();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private DailyBudgetSummaryResponse buildDailySummary(LocalDate date,
                                                          BigDecimal budgetLimit,
                                                          List<DiaryEntryItem> items) {
        Map<MealType, List<DiaryEntryItem>> grouped = items.stream()
                .collect(Collectors.groupingBy(DiaryEntryItem::getMealType));

        List<MealBudgetBreakdown> breakdown = Arrays.stream(MealType.values())
                .filter(grouped::containsKey)
                .map(mealType -> {
                    List<DiaryEntryItem> mealItems = grouped.get(mealType);
                    BigDecimal mealTotal = sumPrices(mealItems);
                    return MealBudgetBreakdown.builder()
                            .mealType(mealType)
                            .totalSpent(mealTotal)
                            .itemCount(mealItems.size())
                            .build();
                })
                .toList();

        BigDecimal totalSpent = breakdown.stream()
                .map(MealBudgetBreakdown::getTotalSpent)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal remaining = budgetLimit != null
                ? budgetLimit.subtract(totalSpent).setScale(2, RoundingMode.HALF_UP)
                : null;

        BigDecimal percentageUsed = (budgetLimit != null && budgetLimit.compareTo(BigDecimal.ZERO) > 0)
                ? totalSpent.divide(budgetLimit, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .setScale(2, RoundingMode.HALF_UP)
                : null;

        return DailyBudgetSummaryResponse.builder()
                .date(date)
                .budgetLimit(budgetLimit)
                .totalSpent(totalSpent)
                .remainingBudget(remaining)
                .percentageUsed(percentageUsed)
                .totalItemsLogged(items.size())
                .mealBreakdown(breakdown)
                .build();
    }

    private BigDecimal resolveBudgetLimit(UUID userId) {
        return goalRepository.findByUserIdAndActiveTrue(userId)
                .map(goal -> goal.getDailyBudgetPhp())
                .orElse(null);
    }

    private BigDecimal sumPrices(List<DiaryEntryItem> items) {
        return items.stream()
                .map(DiaryEntryItem::getPriceAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
