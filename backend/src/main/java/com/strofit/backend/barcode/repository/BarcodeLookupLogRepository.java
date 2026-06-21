package com.strofit.backend.barcode.repository;

import com.strofit.backend.barcode.entity.BarcodeLookupLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface BarcodeLookupLogRepository extends JpaRepository<BarcodeLookupLog, UUID> {
}
