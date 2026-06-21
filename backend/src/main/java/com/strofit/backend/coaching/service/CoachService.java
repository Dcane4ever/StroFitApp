package com.strofit.backend.coaching.service;

import com.strofit.backend.coaching.dto.*;
import com.strofit.backend.coaching.entity.CoachTraineeLink;
import com.strofit.backend.coaching.enums.LinkStatus;
import com.strofit.backend.coaching.repository.CoachTraineeLinkRepository;
import com.strofit.backend.common.exception.AppException;
import com.strofit.backend.common.exception.ResourceNotFoundException;
import com.strofit.backend.profile.UserProfileRepository;
import com.strofit.backend.user.User;
import com.strofit.backend.user.UserRepository;
import com.strofit.backend.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CoachService {

    private final CoachTraineeLinkRepository linkRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final CoachAggregationService aggregationService;

    // -------------------------------------------------------------------------
    // POST /coach/invite
    // -------------------------------------------------------------------------

    @Transactional
    public CoachTraineeLinkResponse invite(UUID coachId, InviteTraineeRequest request) {
        requireCoach(coachId);

        User trainee = userRepository.findByEmail(request.getTraineeEmail().toLowerCase())
                .orElseThrow(() -> new AppException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND",
                        "No user found with email: " + request.getTraineeEmail()));

        if (trainee.getId().equals(coachId)) {
            throw new AppException(HttpStatus.BAD_REQUEST, "SELF_INVITE", "Cannot invite yourself");
        }

        // Prevent duplicate pending/active link
        linkRepository.findByCoachUserIdAndTraineeUserId(coachId, trainee.getId())
                .ifPresent(existing -> {
                    if (existing.getStatus() == LinkStatus.PENDING || existing.getStatus() == LinkStatus.ACTIVE) {
                        throw new AppException(HttpStatus.CONFLICT, "LINK_EXISTS",
                                "A link already exists with status " + existing.getStatus());
                    }
                });

        CoachTraineeLink link = CoachTraineeLink.builder()
                .coachUserId(coachId)
                .traineeUserId(trainee.getId())
                .status(LinkStatus.PENDING)
                .inviteMessage(request.getInviteMessage())
                .build();

        link = linkRepository.save(link);

        String displayName = profileRepository.findByUserId(trainee.getId())
                .map(p -> p.getDisplayName())
                .orElse(trainee.getEmail());

        return CoachTraineeLinkResponse.from(link, trainee.getEmail(), displayName);
    }

    // -------------------------------------------------------------------------
    // GET /coach/trainees
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<CoachTraineeLinkResponse> getTrainees(UUID coachId) {
        requireCoach(coachId);
        return linkRepository.findByCoachUserIdAndStatus(coachId, LinkStatus.ACTIVE)
                .stream()
                .map(link -> {
                    User trainee = userRepository.findById(link.getTraineeUserId()).orElse(null);
                    String email = trainee != null ? trainee.getEmail() : null;
                    String name = trainee != null
                            ? profileRepository.findByUserId(trainee.getId())
                                    .map(p -> p.getDisplayName()).orElse(email)
                            : null;
                    return CoachTraineeLinkResponse.from(link, email, name);
                })
                .toList();
    }

    // -------------------------------------------------------------------------
    // GET /coach/trainees/{traineeId}/summary
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public TraineeSummaryResponse getTraineeSummary(UUID coachId, UUID traineeId) {
        requireCoach(coachId);
        requireActiveLink(coachId, traineeId);

        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Trainee"));

        return aggregationService.buildSummary(trainee);
    }

    // -------------------------------------------------------------------------
    // DELETE /coach/trainees/{traineeId}
    // -------------------------------------------------------------------------

    @Transactional
    public void removeTrainee(UUID coachId, UUID traineeId) {
        requireCoach(coachId);
        CoachTraineeLink link = requireActiveLink(coachId, traineeId);
        link.setStatus(LinkStatus.REMOVED);
        linkRepository.save(link);
    }

    // -------------------------------------------------------------------------
    // GET /trainee/coach
    // -------------------------------------------------------------------------

    @Transactional(readOnly = true)
    public List<TraineeCoachResponse> getMyCoach(UUID traineeId) {
        return linkRepository.findByTraineeUserIdOrderByCreatedAtDesc(traineeId)
                .stream()
                .filter(l -> l.getStatus() == LinkStatus.PENDING || l.getStatus() == LinkStatus.ACTIVE)
                .map(link -> {
                    User coach = userRepository.findById(link.getCoachUserId()).orElse(null);
                    String email = coach != null ? coach.getEmail() : null;
                    String name = coach != null
                            ? profileRepository.findByUserId(coach.getId())
                                    .map(p -> p.getDisplayName()).orElse(email)
                            : null;
                    return TraineeCoachResponse.from(link, email, name);
                })
                .toList();
    }

    // -------------------------------------------------------------------------
    // POST /trainee/invite/{inviteId}/accept
    // -------------------------------------------------------------------------

    @Transactional
    public TraineeCoachResponse acceptInvite(UUID traineeId, UUID inviteId) {
        CoachTraineeLink link = linkRepository.findByIdAndTraineeUserId(inviteId, traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Invite"));

        if (link.getStatus() != LinkStatus.PENDING) {
            throw new AppException(HttpStatus.CONFLICT, "INVALID_STATE",
                    "Invite is not in PENDING state");
        }

        // Enforce one active coach per trainee
        linkRepository.findByTraineeUserIdAndStatus(traineeId, LinkStatus.ACTIVE)
                .ifPresent(existing -> {
                    throw new AppException(HttpStatus.CONFLICT, "ALREADY_HAS_COACH",
                            "You already have an active coach. Remove them before accepting a new invite.");
                });

        link.setStatus(LinkStatus.ACTIVE);
        link = linkRepository.save(link);

        User coach = userRepository.findById(link.getCoachUserId()).orElse(null);
        String email = coach != null ? coach.getEmail() : null;
        String name = coach != null
                ? profileRepository.findByUserId(coach.getId())
                        .map(p -> p.getDisplayName()).orElse(email)
                : null;

        return TraineeCoachResponse.from(link, email, name);
    }

    // -------------------------------------------------------------------------
    // POST /trainee/invite/{inviteId}/reject
    // -------------------------------------------------------------------------

    @Transactional
    public void rejectInvite(UUID traineeId, UUID inviteId) {
        CoachTraineeLink link = linkRepository.findByIdAndTraineeUserId(inviteId, traineeId)
                .orElseThrow(() -> new ResourceNotFoundException("Invite"));

        if (link.getStatus() != LinkStatus.PENDING) {
            throw new AppException(HttpStatus.CONFLICT, "INVALID_STATE",
                    "Invite is not in PENDING state");
        }

        link.setStatus(LinkStatus.REJECTED);
        linkRepository.save(link);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private User requireCoach(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User"));
        if (user.getRole() != UserRole.COACH) {
            throw new AppException(HttpStatus.FORBIDDEN, "NOT_A_COACH",
                    "This endpoint requires COACH role");
        }
        return user;
    }

    private CoachTraineeLink requireActiveLink(UUID coachId, UUID traineeId) {
        return linkRepository.findByCoachUserIdAndTraineeUserId(coachId, traineeId)
                .filter(l -> l.getStatus() == LinkStatus.ACTIVE)
                .orElseThrow(() -> new AppException(HttpStatus.FORBIDDEN, "NO_ACTIVE_LINK",
                        "No active coach-trainee relationship found"));
    }
}
