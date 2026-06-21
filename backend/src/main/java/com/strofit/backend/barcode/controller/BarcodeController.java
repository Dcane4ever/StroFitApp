package com.strofit.backend.barcode.controller;

import com.strofit.backend.barcode.BarcodeService;
import com.strofit.backend.barcode.dto.BarcodeLookupResponse;
import com.strofit.backend.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/barcodes")
@RequiredArgsConstructor
public class BarcodeController {

    private final BarcodeService barcodeService;

    /**
     * GET /barcodes/{barcode}
     * Local-first lookup. Falls back to external enrichment if not found locally.
     * Always returns 200 — check the status field for FOUND_LOCAL / FOUND_ENRICHED / NOT_FOUND.
     */
    @GetMapping("/{barcode}")
    public ResponseEntity<ApiResponse<BarcodeLookupResponse>> lookup(
            @PathVariable String barcode) {
        return ResponseEntity.ok(ApiResponse.ok(barcodeService.lookup(barcode)));
    }

    /**
     * POST /barcodes/{barcode}/enrich
     * [INTERNAL/DEV] Manually trigger external enrichment for a specific barcode.
     * Useful during development to seed the local database without scanning.
     * Does not require auth in dev — secure before deploying to production.
     */
    @PostMapping("/{barcode}/enrich")
    public ResponseEntity<ApiResponse<BarcodeLookupResponse>> forceEnrich(
            @PathVariable String barcode) {
        return ResponseEntity.ok(ApiResponse.ok(barcodeService.lookup(barcode)));
    }
}
