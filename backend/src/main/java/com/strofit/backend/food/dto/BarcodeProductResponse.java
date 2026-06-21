package com.strofit.backend.food.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.food.entity.BrandedProduct;
import com.strofit.backend.food.entity.ProductBarcode;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class BarcodeProductResponse {

    private UUID productId;
    private String brandName;
    private String productName;
    private String packageSizeText;
    private BigDecimal netWeightG;
    private BigDecimal servingSizeG;
    private String servingSizeLabel;
    private String imageUrl;
    private String barcodeValue;

    // Full food item detail embedded in the barcode response
    private FoodItemResponse foodItem;

    public static BarcodeProductResponse from(
            ProductBarcode barcode,
            BrandedProduct product,
            FoodItemResponse foodItemResponse) {
        return BarcodeProductResponse.builder()
                .productId(product.getId())
                .brandName(product.getBrandName())
                .productName(product.getProductName())
                .packageSizeText(product.getPackageSizeText())
                .netWeightG(product.getNetWeightG())
                .servingSizeG(product.getServingSizeG())
                .servingSizeLabel(product.getServingSizeLabel())
                .imageUrl(product.getImageUrl())
                .barcodeValue(barcode.getBarcodeValue())
                .foodItem(foodItemResponse)
                .build();
    }
}
