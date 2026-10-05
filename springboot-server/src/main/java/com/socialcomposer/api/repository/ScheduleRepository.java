package com.socialcomposer.api.repository;

import com.socialcomposer.api.entity.ScheduledPost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<ScheduledPost, Long> {

    List<ScheduledPost> findByOrderByScheduledDateAscScheduledTimeAsc();

    List<ScheduledPost> findByScheduledDateOrderByScheduledTimeAsc(String scheduledDate);

    List<ScheduledPost> findByAuthorIdOrderByScheduledDateAscScheduledTimeAsc(Long authorId);
}
