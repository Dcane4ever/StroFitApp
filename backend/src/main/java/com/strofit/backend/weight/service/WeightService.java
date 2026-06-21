package com.strofit.backend.weight.service;

import com.strofit.backend.common.exception.AppException;
import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.profile.UserProfileRepository;
import com.strofit.backend.weight.dto.*;
import com.strofit.backend.weight.entity.WeightLog;
import com.strofit.backend.weight.enums.WeightUnit;
import com.strofit.backend.weight.repository.WeightLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WeightService {

    private final WeightLogRepository weightLogRepository;
    private final UserProfileRepository userProfileRepository;

    // -------------------------------------------------------------------------
    // POST /weights
    // -------------------------------------------------------------------------

    @Transactional
    public WeightLogResponse addLog(UUID userId, AddWeightLogRequest request) {
        WeightUnit unit = request.getWeightUnit() != null ? request.getWeightUnit() : WeightUnit.KG;

        WeightLog log = WeightLog.builder()
                .userId(userId)
                .loggedAt(request.getLoggedAt())
                .weightValue(request.getWeightValue())
                .weightUnit(unit)
                .bodyFatPercentage(request.getBodyFatPercentage())
                .waistCm(request.getWaistCm())
                .note(request.getNote())
                .build();

        log = weightLogRepository.save(log);

        syncProfileWeight(userId, log);

        return WeightLogResponse.from(log);
    }

    // -------------------------------------------------------------------------
    // PUT /weights/{id}
    // -------------------------------------------------------------------------

    @Transactional
    public WeightLogResponse updateLog(UUID userId, UUID logId, UpdateWeightLogRequest request) {
        WeightLog log = findOwnedLog(userId, logId);

        WeightUnit unit = request.getWeightUnit() != null ? request.getWeightUnit() : WeightUnit.KG;

        log.setLoggedAt(request.getLoggedAt());
        log.setWeightValue(request.getWeightValue());
        log.setWeightUnit(unit);
        log.setBodyFatPercentage(request.getBodyFatPercentage());
        log.setWaistCm(request.getWaistCm());
        log.setNote(request.getNote());

        log = weightLogRepository.save(log);

        syncProfileWeight(userId, log);

        return WeightLogResponse.from(log);
    }

    // -------------------------------------------------------------------------
    // DELETE /weights/{id}
    // -------------------------------------------------------------------------

    @Transactional
    public void deleteLog(UUID userId, UUID logId) {
        WeightLog log = findOwnedLog(userId, logId);
        Instant deletedAt = log.getLoggedAt();

        weightLogRepository.delete(log);

        // Roll back profile weight to the previous log, or null if no logs remain
        weightLogRepository.findLatestBefore(userId, deletedAt)
                .ifPresentOrElse(
                        prev -> updateProfileWeight(userId, prev.getWeightValue()),
                        () -> {
                            // Also check if there's any log after the deleted one
                            weightLogRepository.findTopByUserIdOrderByLoggedAtDesc(userId)
                                    .ifPresentOrElse(
                                            latest -> updateProfileWeight(userId, latest.getWeightValue()),
                                            () -> updateProfileWeight(userId, null)
                                    );
                        }
                );
    }

    // -------------------------------------------------------------------------
    // GET /weights?start=&end=
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<WeightLogResponse> getLogs(UUID userId, LocalDate start, LocalDate end) {
        validateRange(start, end);
        Instant startInstant = start.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        return weightLogRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(userId, startInstant, endInstant)
                .stream()
                .map(WeightLogResponse::from)
                .toList();
    }

    // -------------------------------------------------------------------------
    // GET /weights/summary?start=&end=
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public WeightProgressSummaryResponse getSummary(UUID userId, LocalDate start, LocalDate end) {
        validateRange(start, end);
        Instant startInstant = start.atStartOfDay(ZoneOffset.UTC).toInstant();
        Instant endInstant = end.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant();

        List<WeightLog> rangeLogs = weightLogRepository
                .findByUserIdAndLoggedAtBetweenOrderByLoggedAtAsc(userId, startInstant, endInstant);

        WeightLog latest = weightLogRepository.findTopByUserIdOrderByLoggedAtDesc(userId).orElse(null);

        BigDecimal avgWeight = weightLogRepository.avgWeightInRange(userId, startInstant, endInstant)
                .map(v -> v.setScale(2, RoundingMode.HALF_UP))
                .orElse(null);

        BigDecimal firstWeight = rangeLogs.isEmpty() ? null : rangeLogs.getFirst().getWeightValue();
        BigDecimal lastWeight  = rangeLogs.isEmpty() ? null : rangeLogs.getLast().getWeightValue();
        BigDecimal change = (firstWeight != null && lastWeight != null)
                ? lastWeight.subtract(firstWeight).setScale(2, RoundingMode.HALF_UP)
                : null;

        return WeightProgressSummaryResponse.builder()
                .currentWeight(latest != null ? latest.getWeightValue() : null)
                .currentWeightUnit(latest != null ? latest.getWeightUnit() : null)
                .latestLoggedAt(latest != null ? latest.getLoggedAt() : null)
                .firstWeightInRange(firstWeight)
                .lastWeightInRange(lastWeight)
                .weightChange(change)
                .averageWeightInRange(avgWeight)
                .totalLogsInRange(rangeLogs.size())
                .build();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private WeightLog findOwnedLog(UUID userId, UUID logId) {
        WeightLog log = weightLogRepository.findById(logId)
                .orElseThrow(() -> new ResourceNotFoundException("Weight log"));
        if (!log.getUserId().equals(userId)) {
            throw new AppException(HttpStatus.FORBIDDEN, "ACCESS_DENIED", "Access denied");
        }
        return log;
    }

    private void syncProfileWeight(UUID userId, WeightLog savedLog) {
        // Only sync if this log is the most recent one for the user
        weightLogRepository.findTopByUserIdOrderByLoggedAtDesc(userId).ifPresent(latest -> {
            if (latest.getId().equals(savedLog.getId())) {
                updateProfileWeight(userId, savedLog.getWeightValue());
            }
        });
    }

    private void updateProfileWeight(UUID userId, BigDecimal value) {
        userProfileRepository.findByUserId(userId).ifPresent(profile -> {
            profile.setCurrentWeightKg(value);
            userProfileRepository.save(profile);
            log.info("Profile weight synced for user {}: {}", userId, value);
        });
    }

    private void validateRange(LocalDate start, LocalDate end) {
        if (start.isAfter(end)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "INVALID_DATE_RANGE", "start must not be after end");
        }
    }
}
