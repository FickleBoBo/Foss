package com.ssafy.foss.schedule.service;

import com.ssafy.foss.schedule.domain.Apply;
import com.ssafy.foss.schedule.domain.ConfirmedApply;
import com.ssafy.foss.schedule.domain.Schedule;
import com.ssafy.foss.schedule.dto.*;
import com.ssafy.foss.schedule.exception.InvalidDateFormatException;
import com.ssafy.foss.schedule.exception.InvalidMonthException;
import com.ssafy.foss.schedule.repository.ApplyRepository;
import com.ssafy.foss.schedule.repository.ConfirmedApplyRepository;
import com.ssafy.foss.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class MentorService {
    private final ScheduleRepository scheduleRepository;
    private final ApplyRepository applyRepository;
    private final ConfirmedApplyRepository confirmedApplyRepository;

    @Transactional
    public Schedule createSchedule(CreateScheduleRequest request) {
        return scheduleRepository.save(buildSchedule(request.getMentorId(), parseDate(request.getDate())));
    }

    @Transactional
    public List<ScheduleResponse> findScheduleAndApplyByMentorId(Long mentorId, int month) {
        validateMonth(month);
        LocalDateTime startDate = getStartDate(month);
        LocalDateTime endDate = getEndDate(startDate, month);

        return mapToScheduleAndApplyResponse(groupSchedulesByDate(scheduleRepository.findScheduleByMentorIdAndDateBetween(mentorId, startDate, endDate)));
    }

    @Transactional
    public void confirmSchedule(ConfirmScheduleRequest request) {
        Long scheduleId = request.getScheduleId();
        List<Long> memberIds = request.getMemberIds();

        Schedule schedule = scheduleRepository.findById(scheduleId).orElseThrow(
                () -> new RuntimeException("식별자가 " + scheduleId + "인 일정 정보를 찾을 수 없습니다.")
        );

        if (schedule.isConfirmed()) {
            throw new RuntimeException("이미 확정된 일정입니다.");
        }

        schedule.updateConfirmStatus(true);

        List<Apply> applies = applyRepository.findByApplyId_ScheduleId(scheduleId);
        List<Apply> confirmedApplies = filterConfirmedApplies(applies, memberIds);

        confirmedApplyRepository.saveAll(mapToConfirmApply(confirmedApplies));
        applyRepository.deleteAll(applies);
    }

    @Transactional
    public void deleteSchedule(Long scheduleId) {
        scheduleRepository.deleteById(scheduleId);
        applyRepository.deleteAll(applyRepository.findByApplyId_ScheduleId(scheduleId));
    }

    private void validateMonth(int month) {
        if (month < 1 || month > 12) {
            throw new InvalidMonthException("Invalid month: " + month);
        }
    }

    private LocalDateTime getStartDate(int month) {
        int currentYear = LocalDate.now().getYear();
        return LocalDateTime.of(currentYear, month, 1, 0, 0);
    }

    private LocalDateTime getEndDate(LocalDateTime startDate, int month) {
        if (month == 12) {
            return LocalDateTime.of(startDate.getYear() + 1, 2, 1, 0, 0);
        } else {
            return startDate.plusMonths(2);
        }
    }

    private Map<String, List<ScheduleAndApplyResponse>> groupSchedulesByDate(List<Schedule> schedules) {
        return schedules.stream().collect(Collectors.groupingBy(
                schedule -> schedule.getDate().toLocalDate().toString(),
                Collectors.mapping(schedule -> {
                    List<ApplyResponse> applies = getApplyResponses(schedule);
                    return new ScheduleAndApplyResponse(schedule.getDate().toLocalTime().toString(), schedule.getScheduleId(), schedule.isConfirmed(), applies);
                }, Collectors.toList())
        ));
    }

    // TODO : "김형민" → memberRepository.findById(apply.getMemberId()).orElseThrow().getName()
    private List<ApplyResponse> getApplyResponses(Schedule schedule) {
        return schedule.isConfirmed() ?
                confirmedApplyRepository.findByApplyId_ScheduleId(schedule.getScheduleId()).stream()
                        .map(apply -> new ApplyResponse(apply, "김형민"))
                        .collect(Collectors.toList()) :
                applyRepository.findByApplyId_ScheduleId(schedule.getScheduleId()).stream()
                        .map(apply -> new ApplyResponse(apply, "김형민"))
                        .collect(Collectors.toList());
    }

    private List<ScheduleResponse> mapToScheduleAndApplyResponse(Map<String, List<ScheduleAndApplyResponse>> groupedSchedule) {
        return groupedSchedule.entrySet().stream()
                .map(entry -> new ScheduleResponse(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());
    }

    private List<ConfirmedApply> mapToConfirmApply(List<Apply> comfirmedApplies) {
        return comfirmedApplies.stream()
                .map(apply -> new ConfirmedApply(apply.getApplyId(), apply.getFileUrl()))
                .collect(Collectors.toList());
    }


    private LocalDateTime parseDate(String date) {
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
            return LocalDateTime.parse(date, formatter);
        } catch (DateTimeParseException e) {
            throw new InvalidDateFormatException("Invalid Date format: " + date);
        }
    }

    private Schedule buildSchedule(Long mentorId, LocalDateTime dateTime) {
        return Schedule.builder()
                .mentorId(mentorId)
                .date(dateTime)
                .build();
    }

    private List<Apply> filterConfirmedApplies(List<Apply> applies, List<Long> memberIds) {
        return applies.stream()
                .filter(apply -> memberIds.contains(apply.getApplyId().getMemberId()))
                .collect(Collectors.toList());
    }

}