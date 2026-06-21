package com.strofit.backend.food.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "product_barcodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductBarcode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "branded_product_id", nullable = false)
    private BrandedProduct brandedProduct;

    @Column(name = "barcode_value", nullable = false, length = 50)
    private String barcodeValue;

    @Column(name = "barcode_type", nullable = false, length = 20)
    @Builder.Default
    private String barcodeType = "EAN13";

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private boolean primary = true;

    @Column(name = "source", nullable = false, length = 30)
    @Builder.Default
    private String source = "MANUAL";

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
