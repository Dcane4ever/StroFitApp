package com.strofit.backend.diary.controller;

import com.strofit.backend.common.dto.ApiResponse;
import com.strofit.backend.diary.dto.*;
import com.strofit.backend.diary.service.DiaryService;
import com.strofit.backend.security.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/diary")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;
    private final JwtService jwtService;

    /**
     * GET /diary?date=2025-06-21
     * Returns the full day view (all meals, items, and day totals).
     * Returns an empty structure if no items logged yet — does not create a diary row.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<DiaryDayResponse>> getDiary(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(diaryService.getDiary(userId, date)));
    }

    /**
     * POST /diary/items
     * Log a food item to the diary. Auto-creates the diary entry row if it's the first log for that date.
     */
    @PostMapping("/items")
    public ResponseEntity<ApiResponse<DiaryItemResponse>> addItem(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody AddDiaryItemRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        DiaryItemResponse response = diaryService.addItem(userId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(response));
    }

    /**
     * PUT /diary/items/{itemId}
     * Update quantity, serving unit, meal type, or notes. Recomputes nutrition snapshot.
     */
    @PutMapping("/items/{itemId}")
    public ResponseEntity<ApiResponse<DiaryItemResponse>> updateItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID itemId,
            @Valid @RequestBody UpdateDiaryItemRequest request) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        return ResponseEntity.ok(ApiResponse.ok(diaryService.updateItem(userId, itemId, request)));
    }

    /**
     * DELETE /diary/items/{itemId}
     * Remove a logged item. Returns 204 No Content.
     */
    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<Void> deleteItem(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable UUID itemId) {
        UUID userId = jwtService.extractUserId(authHeader.substring(7));
        diaryService.deleteItem(userId, itemId);
        return ResponseEntity.noContent().build();
    }
}
