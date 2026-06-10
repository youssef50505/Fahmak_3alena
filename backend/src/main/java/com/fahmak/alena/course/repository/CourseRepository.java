package com.fahmak.alena.course.repository;

import com.fahmak.alena.course.entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    List<Course> findByDifficultyLevel(String difficultyLevel);
    List<Course> findTop3ByOrderByCreationDateDesc();
    List<Course> findByInstructor(com.fahmak.alena.user.entity.User instructor);
}
