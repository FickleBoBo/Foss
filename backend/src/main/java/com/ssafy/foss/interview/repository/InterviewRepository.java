package com.ssafy.foss.interview.repository;

import com.ssafy.foss.feedback.dto.response.MenteeFeedbackPendingResponse;
import com.ssafy.foss.interview.domain.Interview;
import com.ssafy.foss.interview.domain.Status;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findAllByMemberIdAndStatusNot(Long memberId, Status status);

    @Query("SELECT i " +
            "FROM Interview i join Respondent r on (i.id = r.interview.id) " +
            "WHERE r.member.id = :menteeId " +
            "and i.status != 'wait'"
    )
    List<Interview> findAllByMenteeId(Long menteeId);


    List<Interview> findAllByMemberIdAndStatusNotAndStartedDateBetween(Long memberId, Status status, LocalDateTime start, LocalDateTime end);

    Optional<Interview> findByMemberIdAndStartedDate(Long memberId, LocalDateTime startedDate);

    @Query("SELECT new com.ssafy.foss.interview.domain.dto.MenteeFeedbackPendingResponse(i.id, i.startedDate, " +
            "new com.ssafy.foss.interview.domain.dto.FeedbackMentorInfoResponse(m.id, m.name, mi.company.name, mi.department, m.profileImg)) " +
            "FROM Interview i " +
            "JOIN i.member m " +
            "JOIN MentorInfo mi ON mi.member.id = m.id " +
            "WHERE i.status = com.ssafy.foss.interview.domain.Status.END " +
            "AND EXISTS (SELECT 1 FROM Respondent r WHERE r.interview.id = i.id AND r.member.id = :memberId) " +
            "AND NOT EXISTS (SELECT 1 FROM MenteeFeedback mf WHERE mf.respondentId IN " +
            "(SELECT r.id FROM Respondent r WHERE r.interview.id = i.id AND r.member.id = :memberId) " +
            "AND mf.menteeId = :memberId)")
    List<MenteeFeedbackPendingResponse> findPendingFeedbackInterviews(@Param("memberId") Long memberId);
}
