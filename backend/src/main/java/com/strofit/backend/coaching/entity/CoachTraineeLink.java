package com.strofit.backend.coaching.entity;

import com.strofit.backend.coaching.enums.LinkStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "coach_trainee_links")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CoachTraineeLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "coach_user_id", nullable = false)
    private UUID coachUserId;

    @Column(name = "trainee_user_id", nullable = false)
    private UUID traineeUserId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private LinkStatus status;

    @Column(name = "invite_message")
    private String inviteMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private Instant updatedAt;
}
