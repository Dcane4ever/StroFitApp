package com.strofit.backend.diary.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.diary.entity.DiaryEntryItem;
import com.strofit.backend.diary.enums.MealType;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class DiaryItemResponse {

    private UUID id;
    private UUID foodItemId;
    private UUID brandedProductId;
    private MealType mealType;

    private BigDecimal quantity;
    private UUID servingUnitId;
    private String servingUnitLabel;
    private BigDecimal gramsPerUnit;
    private BigDecimal totalGrams;

    private BigDecimal calories;
    private BigDecimal proteinG;
    private BigDecimal carbsG;
    private BigDecimal fatG;
    private BigDecimal fiberG;

    private String foodNameSnapshot;
    private String brandNameSnapshot;

    private BigDecimal priceAmount;
    private String priceCurrency;
    private String priceSourceNote;

    private String notes;
    private Instant loggedAt;

    public static DiaryItemResponse from(DiaryEntryItem item) {
        return DiaryItemResponse.builder()
                .id(item.getId())
                .foodItemId(item.getFoodItemId())
                .brandedProductId(item.getBrandedProductId())
                .mealType(item.getMealType())
                .quantity(item.getQuantity())
                .servingUnitId(item.getServingUnitId())
                .servingUnitLabel(item.getServingUnitLabel())
                .gramsPerUnit(item.getGramsPerUnit())
                .totalGrams(item.getTotalGrams())
                .calories(item.getCalories())
                .proteinG(item.getProteinG())
                .carbsG(item.getCarbsG())
                .fatG(item.getFatG())
                .fiberG(item.getFiberG())
                .foodNameSnapshot(item.getFoodNameSnapshot())
                .brandNameSnapshot(item.getBrandNameSnapshot())
                .priceAmount(item.getPriceAmount())
                .priceCurrency(item.getPriceCurrency())
                .priceSourceNote(item.getPriceSourceNote())
                .notes(item.getNotes())
                .loggedAt(item.getLoggedAt())
                .build();
    }
}
