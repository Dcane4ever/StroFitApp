package com.strofit.backend.food.entity;

import com.strofit.backend.food.enums.ServingUnitType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "food_serving_units")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FoodServingUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "food_item_id", nullable = false)
    private FoodItem foodItem;

    @Enumerated(EnumType.STRING)
    @Column(name = "unit_type", nullable = false, length = 20)
    private ServingUnitType unitType;

    // Display label shown in the UI — e.g. "tasa", "cup", "1 sachet (25g)"
    @Column(name = "unit_label", nullable = false, length = 50)
    private String unitLabel;

    // Grams equivalent for 1 unit of this type for this specific food.
    // Macro math: serving_macros = (quantity * gramsPerUnit / 100) * per100gValue
    @Column(name = "grams_per_unit", nullable = false, precision = 8, scale = 3)
    private BigDecimal gramsPerUnit;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean defaultUnit = false;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private int sortOrder = 0;
}
