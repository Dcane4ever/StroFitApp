package com.strofit.backend.food.entity;

import com.strofit.backend.food.enums.ConfidenceLevel;
import com.strofit.backend.food.enums.FoodSource;
import com.strofit.backend.food.enums.FoodType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "food_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 100)
    private String category;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_type", nullable = false, length = 30)
    @Builder.Default
    private FoodType foodType = FoodType.GENERIC;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 30)
    @Builder.Default
    private FoodSource sourceType = FoodSource.CURATED;

    @Enumerated(EnumType.STRING)
    @Column(name = "confidence_level", nullable = false, length = 20)
    @Builder.Default
    private ConfidenceLevel confidenceLevel = ConfidenceLevel.HIGH;

    @Column(name = "is_verified", nullable = false)
    @Builder.Default
    private boolean verified = false;

    @Column(name = "is_public", nullable = false)
    @Builder.Default
    private boolean publicFood = true;

    // FK to food_serving_units — set after the default unit is created.
    // Nullable to avoid chicken-and-egg on initial insert.
    @Column(name = "default_serving_unit_id")
    private UUID defaultServingUnitId;

    @Column(name = "created_by_user_id")
    private UUID createdByUserId;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_source_json", columnDefinition = "jsonb")
    private String rawSourceJson;

    @Column(name = "external_source_name", length = 100)
    private String externalSourceName;

    @Column(name = "external_source_id", length = 255)
    private String externalSourceId;

    @Column(name = "last_verified_at")
    private OffsetDateTime lastVerifiedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    // Associations — loaded lazily; services fetch what they need explicitly
    @OneToOne(mappedBy = "foodItem", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private FoodNutrition nutrition;

    @OneToMany(mappedBy = "foodItem", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<FoodServingUnit> servingUnits = new ArrayList<>();

    @OneToMany(mappedBy = "foodItem", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @Builder.Default
    private List<FoodAlias> aliases = new ArrayList<>();
}
