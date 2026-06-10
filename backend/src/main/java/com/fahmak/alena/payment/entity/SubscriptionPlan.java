package com.fahmak.alena.payment.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subscription_plans")
@Data
@NoArgsConstructor
public class SubscriptionPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., BASIC, PREMIUM, ENTERPRISE

    @Column(nullable = false, unique = true)
    private String stripePriceId; // Stripe price identifier

    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private String currency = "usd";

    @Column(name = "billing_interval", nullable = false)
    private String interval = "month"; // month, year
}
