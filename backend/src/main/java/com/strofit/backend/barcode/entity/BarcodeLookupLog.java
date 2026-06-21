package com.strofit.backend.barcode.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "barcode_lookup_log")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BarcodeLookupLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "barcode_value", nullable = false, length = 50)
    private String barcodeValue;

    @Column(name = "source_name", nullable = false, length = 100)
    private String sourceName;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "looked_up_at", nullable = false)
    private Instant lookedUpAt;

    public enum Status {
        HIT, MISS, ERROR
    }
}
