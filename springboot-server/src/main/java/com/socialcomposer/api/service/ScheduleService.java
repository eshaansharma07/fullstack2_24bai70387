package com.socialcomposer.api.service;

import com.socialcomposer.api.dto.request.CreateScheduleRequest;
import com.socialcomposer.api.dto.request.UpdateScheduleRequest;
import com.socialcomposer.api.dto.response.ScheduleResponse;

import java.util.List;

public interface ScheduleService {

    ScheduleResponse createSchedule(CreateScheduleRequest request);

    List<ScheduleResponse> getAllSchedules();

    ScheduleResponse getScheduleById(Long id);

    ScheduleResponse updateSchedule(Long id, UpdateScheduleRequest request);

    void deleteSchedule(Long id);
}
