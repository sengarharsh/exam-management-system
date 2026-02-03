package com.parikshasetu.resultservice.repository;

import com.parikshasetu.resultservice.model.Result;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResultRepository extends JpaRepository<Result, Long> {
    List<Result> findByStudentId(Long studentId);

    List<Result> findByExamId(Long examId);

    List<Result> findByExamIdIn(List<Long> examIds);
}
