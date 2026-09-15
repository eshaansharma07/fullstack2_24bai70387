package com.socialcomposer.api.controller;

import com.socialcomposer.api.dto.request.CreateScheduleRequest;
import com.socialcomposer.api.dto.request.UpdateScheduleRequest;
import com.socialcomposer.api.dto.response.ApiResponse;
import com.socialcomposer.api.dto.response.ScheduleResponse;
import com.socialcomposer.api.service.ScheduleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/schedules")
@RequiredArgsConstructor
@Tag(name = "Schedule API", description = "CRUD operations for scheduled social media posts")
public class ScheduleController {

    private final ScheduleService scheduleService;

    @PostMapping
    @Operation(summary = "Create Schedule", description = "Schedules a social media post with date and time validation")
    public ResponseEntity<ApiResponse<ScheduleResponse>> createSchedule(@Valid @RequestBody CreateScheduleRequest request) {
        ScheduleResponse response = scheduleService.createSchedule(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(response, "Post scheduled successfully."));
    }

    @GetMapping
    @Operation(summary = "Get All Scheduled Posts", description = "Retrieves all scheduled posts sorted chronologically")
    public ResponseEntity<ApiResponse<List<ScheduleResponse>>> getAllSchedules() {
        List<ScheduleResponse> schedules = scheduleService.getAllSchedules();
        return ResponseEntity.ok(ApiResponse.success(schedules, "Retrieved all scheduled posts."));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Schedule By ID", description = "Retrieves specific scheduled post")
    public ResponseEntity<ApiResponse<ScheduleResponse>> getScheduleById(@PathVariable Long id) {
        ScheduleResponse schedule = scheduleService.getScheduleById(id);
        return ResponseEntity.ok(ApiResponse.success(schedule, "Scheduled post retrieved successfully."));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update Schedule", description = "Updates date, time, or content of a scheduled post")
    public ResponseEntity<ApiResponse<ScheduleResponse>> updateSchedule(
            @PathVariable Long id,
            @Valid @RequestBody UpdateScheduleRequest request
    ) {
        ScheduleResponse updated = scheduleService.updateSchedule(id, request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Scheduled post updated successfully."));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel Schedule", description = "Deletes scheduled post from calendar")
    public ResponseEntity<ApiResponse<Void>> deleteSchedule(@PathVariable Long id) {
        scheduleService.deleteSchedule(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Scheduled post cancelled successfully."));
    }
}
