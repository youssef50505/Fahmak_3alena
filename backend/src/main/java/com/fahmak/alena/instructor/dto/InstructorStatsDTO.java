package com.fahmak.alena.instructor.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class InstructorStatsDTO {
    private int totalActiveStudents;
    private double avgCourseScore;
    private double completionRate;
}
