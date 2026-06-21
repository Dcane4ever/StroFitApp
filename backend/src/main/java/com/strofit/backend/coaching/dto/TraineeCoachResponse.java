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
public class TraineeCoachResponse {

    private UUID linkId;
    private UUID coachUserId;
    private String coachDisplayName;
    private String coachEmail;
    private LinkStatus status;
    private String inviteMessage;
    private Instant linkedAt;

    public static TraineeCoachResponse from(CoachTraineeLink link,
                                            String coachEmail,
                                            String coachDisplayName) {
        return TraineeCoachResponse.builder()
                .linkId(link.getId())
                .coachUserId(link.getCoachUserId())
                .coachEmail(coachEmail)
                .coachDisplayName(coachDisplayName)
                .status(link.getStatus())
                .inviteMessage(link.getInviteMessage())
                .linkedAt(link.getUpdatedAt())
                .build();
    }
}
