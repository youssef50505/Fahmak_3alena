package com.fahmak.alena.course.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "lessons")
@Data
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = jakarta.persistence.FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    private String title;
    private String contentUrl; // Video URL, Document link, etc.
    private String lessonType; // VIDEO, ARTICLE, INTERACTIVE
    private Integer durationMinutes;
    private Integer orderIndex;
}
