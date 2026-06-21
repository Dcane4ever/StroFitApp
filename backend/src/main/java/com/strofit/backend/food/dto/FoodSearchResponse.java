package com.strofit.backend.food.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class FoodSearchResponse {

    private List<FoodItemResponse> results;
    private int count;
    private long total;
    private int page;
    private int pageSize;
    private boolean hasMore;
}
