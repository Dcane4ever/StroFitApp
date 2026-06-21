package com.strofit.backend.profile.dto;

import com.strofit.backend.profile.ActivityLevel;
import com.strofit.backend.profile.Sex;
import com.strofit.backend.profile.UnitPreference;
import com.strofit.backend.profile.UserProfile;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Builder
public class UserProfileResponse {

    private UUID id;
    private UUID userId;
    private String displayName;
    private String email;
    private String role;
    private Sex sex;
    private LocalDate birthDate;
    private BigDecimal heightCm;
    private BigDecimal currentWeightKg;
    private BigDecimal targetWeightKg;
    private ActivityLevel activityLevel;
    private UnitPreference unitPreference;
    private OffsetDateTime updatedAt;

    public static UserProfileResponse from(UserProfile profile) {
        return UserProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .displayName(profile.getDisplayName())
                .email(profile.getUser().getEmail())
                .role(profile.getUser().getRole().name())
                .sex(profile.getSex())
                .birthDate(profile.getBirthDate())
                .heightCm(profile.getHeightCm())
                .currentWeightKg(profile.getCurrentWeightKg())
                .targetWeightKg(profile.getTargetWeightKg())
                .activityLevel(profile.getActivityLevel())
                .unitPreference(profile.getUnitPreference())
                .updatedAt(profile.getUpdatedAt())
                .build();
    }
}
