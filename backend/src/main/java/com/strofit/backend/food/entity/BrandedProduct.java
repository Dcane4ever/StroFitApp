package com.strofit.backend.food.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "branded_products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrandedProduct {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false, unique = true)
    private FoodItem foodItem;

    @Column(name = "brand_name", nullable = false)
    private String brandName;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(name = "manufacturer")
    private String manufacturer;

    @Column(name = "package_size_text", length = 100)
    private String packageSizeText;

    @Column(name = "net_weight_g", precision = 8, scale = 2)
    private BigDecimal netWeightG;

    @Column(name = "serving_size_g", precision = 7, scale = 2)
    private BigDecimal servingSizeG;

    @Column(name = "serving_size_label", length = 100)
    private String servingSizeLabel;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(name = "country_of_sale", length = 10)
    @Builder.Default
    private String countryOfSale = "PH";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "brandedProduct", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<ProductBarcode> barcodes = new ArrayList<>();
}
