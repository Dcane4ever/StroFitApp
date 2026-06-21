package com.strofit.backend.food.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "store_prices")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StorePrice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Exactly one of these is non-null — enforced by DB check constraint
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id")
    private FoodItem foodItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branded_product_id")
    private BrandedProduct brandedProduct;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Column(name = "price_php", nullable = false, precision = 8, scale = 2)
    private BigDecimal pricePHP;

    // What quantity this price covers, expressed in grams for cost-per-gram math
    @Column(name = "quantity_g", nullable = false, precision = 8, scale = 2)
    private BigDecimal quantityG;

    // Human-readable label for the quantity, e.g. "1 can (180g)", "per 100g"
    @Column(name = "quantity_label", length = 100)
    private String quantityLabel;

    @Column(name = "currency", nullable = false, length = 5)
    @Builder.Default
    private String currency = "PHP";

    @Column(name = "observed_at", nullable = false)
    @Builder.Default
    private OffsetDateTime observedAt = OffsetDateTime.now();

    @Column(name = "reported_by_user_id")
    private UUID reportedByUserId;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;
}
