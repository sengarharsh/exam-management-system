package com.parikshasetu.resultservice.service;

import com.parikshasetu.resultservice.model.Result;
import com.parikshasetu.resultservice.repository.ResultRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ResultService {

    private final ResultRepository resultRepository;

    public ResultService(ResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    public Result generateResult(Long studentId, Long examId, Integer score, Integer totalMarks) {
        Result result = new Result();
        result.setStudentId(studentId);
        result.setExamId(examId);
        result.setScore(score);
        result.setTotalMarks(totalMarks);
        result.setGeneratedDate(LocalDateTime.now());

        // Calculate Grade
        double percentage = ((double) score / totalMarks) * 100;
        if (percentage >= 90)
            result.setGrade("A");
        else if (percentage >= 75)
            result.setGrade("B");
        else if (percentage >= 50)
            result.setGrade("C");
        else
            result.setGrade("F");

        return resultRepository.save(result);
    }

    public List<Result> getStudentResults(Long studentId) {
        return resultRepository.findByStudentId(studentId);
    }

    public List<Result> getAllResults() {
        return resultRepository.findAll();
    }

    public List<Result> getResultsByExamId(Long examId) {
        return resultRepository.findByExamId(examId);
    }

    public List<Result> getResultsByExamIds(List<Long> examIds) {
        return resultRepository.findByExamIdIn(examIds);
    }
}
