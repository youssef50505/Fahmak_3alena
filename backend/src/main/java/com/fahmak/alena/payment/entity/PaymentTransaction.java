package com.fahmak.alena.payment.entity;

import com.fahmak.alena.user.entity.User;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transactions")
@Data
@NoArgsConstructor
public class PaymentTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(unique = true, nullable = false)
    private String stripePaymentIntentId;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private String currency = "usd";

    @Column(nullable = false)
    private String status; // SUCCEEDED, PENDING, FAILED

    private LocalDateTime createdAt;
}
