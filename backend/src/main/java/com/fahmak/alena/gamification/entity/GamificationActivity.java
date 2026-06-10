package com.fahmak.alena.gamification.entity;

import com.fahmak.alena.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "gamification_activities")
@Data
public class GamificationActivity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    private String activityType; // COURSE_COMPLETION, QUIZ_PASSED, STREAK
    private Integer xpGained;

    @ManyToOne
    @JoinColumn(name = "badge_awarded_id")
    private Badge badgeAwarded;

    private LocalDateTime activityDate;
}
