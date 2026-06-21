package com.strofit.backend.coaching.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class InviteTraineeRequest {

    @NotBlank(message = "trainee_email is required")
    @Email(message = "trainee_email must be a valid email address")
    private String traineeEmail;

    @Size(max = 500, message = "invite_message must be under 500 characters")
    private String inviteMessage;
}
