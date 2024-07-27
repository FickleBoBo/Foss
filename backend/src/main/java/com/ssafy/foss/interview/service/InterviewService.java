package com.ssafy.foss.interview.service;

import com.ssafy.foss.interview.domain.Interview;
import com.ssafy.foss.interview.domain.Status;
import com.ssafy.foss.interview.dto.InterviewDetailResponse;
import com.ssafy.foss.interview.dto.InterviewResponse;
import com.ssafy.foss.interview.repository.InterviewRepository;
import com.ssafy.foss.member.domain.Member;
import com.ssafy.foss.member.service.MemberService;
import com.ssafy.foss.respondent.service.RespondentService;
import com.ssafy.foss.schedule.domain.Schedule;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Transactional(readOnly = true)
@RequiredArgsConstructor
@Service
public class InterviewService {
    private final InterviewRepository interviewRepository;
    private final RespondentService respondentService;
    private final MemberService memberService;

    @Transactional
    public Interview create(Schedule schedule) {
        Member member = memberService.findById(schedule.getMember().getId());

        Interview interview = Interview.builder()
                .member(member)
                .status(Status.WAIT)
                .startedDate(schedule.getDate()).build();

        return interviewRepository.save(interview);
    }

    public List<InterviewResponse> findAllByMentor(Long memberId) {
        List<Interview> interviews = interviewRepository.findAllByMemberIdAndStatusNot(memberId, Status.END);
        return mapToInterviewResponse(interviews);
    }

    private static @NotNull List<InterviewResponse> mapToInterviewResponse(List<Interview> interviews) {
        return interviews.stream()
                .map(interview -> {
                    return InterviewResponse.builder()
                            .name(interview.getMember().getName())
                            .status(interview.getStatus().getValue())
                            .startedDate("아잉").build();
                }).collect(Collectors.toList());
    }

    public List<InterviewResponse> findAllByMentee(Long memberId) {
        List<Interview> interviews = interviewRepository.findAllByMenteeId(memberId);
        return mapToInterviewResponse(interviews);
    }

    public List<InterviewDetailResponse> findAllByMentorAndDate(Long id, String dateString) {
        LocalDate localDate = LocalDate.parse(dateString, DateTimeFormatter.ISO_LOCAL_DATE);
        LocalDateTime startOfDay = localDate.atStartOfDay();
        LocalDateTime endOfDay = localDate.atTime(LocalTime.MAX);

        List<Interview> interviews = interviewRepository.findAllByMemberIdAndStatusNotAndStartedDateBetween(id, Status.END, startOfDay, endOfDay);
        return mapToInterviewDetailResponse(interviews);
    }

    private @NotNull List<InterviewDetailResponse> mapToInterviewDetailResponse(List<Interview> interviews) {
        return interviews.stream()
                .map(interview -> {
                    List<Long> memberIds = respondentService.findMemberIdAllByInterviewId(interview.getId());
                    LocalDateTime startedDate = interview.getStartedDate();
                    return InterviewDetailResponse.builder()
                            .interviewId(interview.getId())
                            .startedDate(String.format("%02d:%02d", startedDate.getHour(), startedDate.getMinute()))
                            .respondents(memberIds).build();
                }).collect(Collectors.toList());
    }
}