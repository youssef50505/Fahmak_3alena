package com.fahmak.alena.gamification.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "badges")
@Data
public class Badge {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private String iconUrl;
    
    @Column(columnDefinition = "TEXT")
    private String criteria;
}
