package com.strofit.backend.coaching.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.strofit.backend.coaching.entity.CoachTraineeLink;
import com.strofit.backend.coaching.enums.LinkStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CoachTraineeLinkResponse {

    private UUID id;
    private UUID coachUserId;
    private UUID traineeUserId;
    private String traineeEmail;
    private String traineeDisplayName;
    private LinkStatus status;
    private String inviteMessage;
    private Instant createdAt;
    private Instant updatedAt;

    public static CoachTraineeLinkResponse from(CoachTraineeLink link) {
        return CoachTraineeLinkResponse.builder()
                .id(link.getId())
                .coachUserId(link.getCoachUserId())
                .traineeUserId(link.getTraineeUserId())
                .status(link.getStatus())
                .inviteMessage(link.getInviteMessage())
                .createdAt(link.getCreatedAt())
                .updatedAt(link.getUpdatedAt())
                .build();
    }

    public static CoachTraineeLinkResponse from(CoachTraineeLink link,
                                                String traineeEmail,
                                                String traineeDisplayName) {
        return CoachTraineeLinkResponse.builder()
                .id(link.getId())
                .coachUserId(link.getCoachUserId())
                .traineeUserId(link.getTraineeUserId())
                .traineeEmail(traineeEmail)
                .traineeDisplayName(traineeDisplayName)
                .status(link.getStatus())
                .inviteMessage(link.getInviteMessage())
                .createdAt(link.getCreatedAt())
                .updatedAt(link.getUpdatedAt())
                .build();
    }
}
