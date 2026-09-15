package com.socialcomposer.api.service.impl;

import com.socialcomposer.api.dto.request.CreateScheduleRequest;
import com.socialcomposer.api.dto.request.UpdateScheduleRequest;
import com.socialcomposer.api.dto.response.ScheduleResponse;
import com.socialcomposer.api.entity.PostStatus;
import com.socialcomposer.api.entity.ScheduledPost;
import com.socialcomposer.api.exception.ResourceNotFoundException;
import com.socialcomposer.api.repository.ScheduleRepository;
import com.socialcomposer.api.service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ScheduleServiceImpl implements ScheduleService {

    private final ScheduleRepository scheduleRepository;

    @Override
    @Transactional
    public ScheduleResponse createSchedule(CreateScheduleRequest request) {
        ScheduledPost post = ScheduledPost.builder()
                .title(request.getTitle())
                .content(request.getContent())
                .mediaUrls(request.getMediaUrls() != null ? request.getMediaUrls() : new ArrayList<>())
                .platforms(request.getPlatforms())
                .scheduledDate(request.getScheduledDate())
                .scheduledTime(request.getScheduledTime())
                .status(PostStatus.SCHEDULED)
                .build();

        ScheduledPost saved = scheduleRepository.save(post);
        return ScheduleResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScheduleResponse> getAllSchedules() {
        return scheduleRepository.findByOrderByScheduledDateAscScheduledTimeAsc().stream()
                .map(ScheduleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ScheduleResponse getScheduleById(Long id) {
        ScheduledPost post = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduledPost", id));
        return ScheduleResponse.fromEntity(post);
    }

    @Override
    @Transactional
    public ScheduleResponse updateSchedule(Long id, UpdateScheduleRequest request) {
        ScheduledPost post = scheduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ScheduledPost", id));

        if (request.getTitle() != null) post.setTitle(request.getTitle());
        if (request.getContent() != null) post.setContent(request.getContent());
        if (request.getMediaUrls() != null) post.setMediaUrls(request.getMediaUrls());
        if (request.getPlatforms() != null) post.setPlatforms(request.getPlatforms());
        if (request.getScheduledDate() != null) post.setScheduledDate(request.getScheduledDate());
        if (request.getScheduledTime() != null) post.setScheduledTime(request.getScheduledTime());

        ScheduledPost updated = scheduleRepository.save(post);
        return ScheduleResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new ResourceNotFoundException("ScheduledPost", id);
        }
        scheduleRepository.deleteById(id);
    }
}
