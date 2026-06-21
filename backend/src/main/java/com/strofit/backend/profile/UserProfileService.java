package com.strofit.backend.profile;

import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.profile.dto.UpdateProfileRequest;
import com.strofit.backend.profile.dto.UserProfileResponse;
import com.strofit.backend.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserProfileService {

    private final UserProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile"));
        return UserProfileResponse.from(profile);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        UserProfile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Profile"));

        profile.setDisplayName(request.getDisplayName());

        if (request.getSex() != null) profile.setSex(request.getSex());
        if (request.getBirthDate() != null) profile.setBirthDate(request.getBirthDate());
        if (request.getHeightCm() != null) profile.setHeightCm(request.getHeightCm());
        if (request.getCurrentWeightKg() != null) profile.setCurrentWeightKg(request.getCurrentWeightKg());
        if (request.getTargetWeightKg() != null) profile.setTargetWeightKg(request.getTargetWeightKg());
        if (request.getActivityLevel() != null) profile.setActivityLevel(request.getActivityLevel());
        if (request.getUnitPreference() != null) profile.setUnitPreference(request.getUnitPreference());

        return UserProfileResponse.from(profileRepository.save(profile));
    }

    @Transactional
    public UserProfile createProfile(User user, String displayName) {
        UserProfile profile = UserProfile.builder()
                .user(user)
                .displayName(displayName)
                .unitPreference(UnitPreference.METRIC)
                .build();
        return profileRepository.save(profile);
    }
}
