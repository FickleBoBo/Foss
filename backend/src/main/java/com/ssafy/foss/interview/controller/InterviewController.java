package com.ssafy.foss.interview.controller;

import com.ssafy.foss.interview.dto.InterviewDetailResponse;
import com.ssafy.foss.interview.dto.InterviewResponse;
import com.ssafy.foss.interview.service.InterviewService;
import com.ssafy.foss.member.domain.PrincipalDetail;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "InterviewController", description = "면접 API")
@RequestMapping("/interviews")
@RestController
@RequiredArgsConstructor
public class InterviewController {
    private final InterviewService interviewService;

    @Operation(summary = "멘토 확정 면접 조회", description = "멘토의 확정된 면접을 조회합니다.(끝난 면접은 조회X)")
    @GetMapping("/mentors")
    public ResponseEntity<List<InterviewResponse>> findAllByMentor(@AuthenticationPrincipal PrincipalDetail principalDetail) {
        return ResponseEntity.ok(interviewService.findAllByMentor(principalDetail.getId()));
    }

    @Operation(summary = "멘티 확정 면접 조회", description = "멘티의 확정된 면접을 조회합니다.(끝난 면접은 조회X)")
    @GetMapping("/mentees")
    public ResponseEntity<List<InterviewResponse>> findAllByMentee(@AuthenticationPrincipal PrincipalDetail principalDetail) {
        return ResponseEntity.ok(interviewService.findAllByMentee(principalDetail.getId()));
    }

    @Operation(summary = "멘토 특정 면접 상세 조회", description = "면접의 시간과 참여 인원을 조회합니다.")
    @GetMapping("/mentors/specific")
    public ResponseEntity<List<InterviewDetailResponse>> findAllByMentorV2(@AuthenticationPrincipal PrincipalDetail principalDetail,
                                                                           @RequestParam String date) {
        return ResponseEntity.ok(interviewService.findAllByMentorAndDate(principalDetail.getId(), date));
    }


}