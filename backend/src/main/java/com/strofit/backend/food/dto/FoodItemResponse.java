package com.strofit.backend.food.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.food.entity.FoodItem;
import com.strofit.backend.food.enums.ConfidenceLevel;
import com.strofit.backend.food.enums.FoodSource;
import com.strofit.backend.food.enums.FoodType;
import lombok.Builder;
import lombok.Getter;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FoodItemResponse {

    private UUID id;
    private String name;
    private String description;
    private String category;
    private FoodType foodType;
    private FoodSource sourceType;
    private ConfidenceLevel confidenceLevel;
    private boolean verified;

    // Nutrition — always present on detail view, may be null on search list view
    private FoodNutritionResponse nutrition;

    // Serving units — present on detail view
    private List<FoodServingUnitResponse> servingUnits;
    private UUID defaultServingUnitId;

    // Prices — present if available
    private List<StorePriceResponse> prices;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static FoodItemResponse from(FoodItem item) {
        return FoodItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .foodType(item.getFoodType())
                .sourceType(item.getSourceType())
                .confidenceLevel(item.getConfidenceLevel())
                .verified(item.isVerified())
                .defaultServingUnitId(item.getDefaultServingUnitId())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }

    // Full detail response — used by GET /foods/{id}
    public static FoodItemResponse fromWithDetails(
            FoodItem item,
            FoodNutritionResponse nutrition,
            List<FoodServingUnitResponse> servingUnits,
            List<StorePriceResponse> prices) {
        return FoodItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .category(item.getCategory())
                .foodType(item.getFoodType())
                .sourceType(item.getSourceType())
                .confidenceLevel(item.getConfidenceLevel())
                .verified(item.isVerified())
                .defaultServingUnitId(item.getDefaultServingUnitId())
                .nutrition(nutrition)
                .servingUnits(servingUnits)
                .prices(prices)
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
