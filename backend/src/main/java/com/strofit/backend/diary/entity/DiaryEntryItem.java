package com.strofit.backend.diary.entity;

import com.strofit.backend.diary.enums.MealType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "diary_entry_items")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiaryEntryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "diary_entry_id", nullable = false)
    private DiaryEntry diaryEntry;

    @Column(name = "food_item_id", nullable = false)
    private UUID foodItemId;

    @Column(name = "branded_product_id")
    private UUID brandedProductId;

    @Enumerated(EnumType.STRING)
    @Column(name = "meal_type", nullable = false, length = 20)
    private MealType mealType;

    @Column(name = "quantity", nullable = false, precision = 10, scale = 3)
    private BigDecimal quantity;

    // Serving unit snapshot
    @Column(name = "serving_unit_id")
    private UUID servingUnitId;

    @Column(name = "serving_unit_label", nullable = false, length = 50)
    private String servingUnitLabel;

    @Column(name = "grams_per_unit", nullable = false, precision = 10, scale = 4)
    private BigDecimal gramsPerUnit;

    @Column(name = "total_grams", nullable = false, precision = 10, scale = 3)
    private BigDecimal totalGrams;

    // Nutrition snapshot
    @Column(name = "calories", nullable = false, precision = 10, scale = 2)
    private BigDecimal calories;

    @Column(name = "protein_g", precision = 10, scale = 2)
    private BigDecimal proteinG;

    @Column(name = "carbs_g", precision = 10, scale = 2)
    private BigDecimal carbsG;

    @Column(name = "fat_g", precision = 10, scale = 2)
    private BigDecimal fatG;

    @Column(name = "fiber_g", precision = 10, scale = 2)
    private BigDecimal fiberG;

    // Name snapshots
    @Column(name = "food_name_snapshot", nullable = false, length = 255)
    private String foodNameSnapshot;

    @Column(name = "brand_name_snapshot", length = 255)
    private String brandNameSnapshot;

    // Price snapshot
    @Column(name = "price_amount", precision = 10, scale = 2)
    private BigDecimal priceAmount;

    @Column(name = "price_currency", length = 3)
    private String priceCurrency;

    @Column(name = "price_source_note", length = 255)
    private String priceSourceNote;

    @Column(name = "notes")
    private String notes;

    @Column(name = "logged_at", nullable = false)
    private Instant loggedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
