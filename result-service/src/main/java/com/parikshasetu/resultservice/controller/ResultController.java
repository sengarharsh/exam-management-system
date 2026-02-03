package com.parikshasetu.resultservice.controller;

import com.parikshasetu.resultservice.model.Result;
import com.parikshasetu.resultservice.service.ResultService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final ResultService resultService;

    public ResultController(ResultService resultService) {
        this.resultService = resultService;
    }

    @PostMapping("/generate")
    public ResponseEntity<Result> generateResult(@RequestBody Map<String, Object> body) {
        Long studentId = Long.valueOf(body.get("studentId").toString());
        Long examId = Long.valueOf(body.get("examId").toString());
        Integer score = Integer.valueOf(body.get("score").toString());
        Integer totalMarks = Integer.valueOf(body.get("totalMarks").toString());

        return ResponseEntity.ok(resultService.generateResult(studentId, examId, score, totalMarks));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Result>> getStudentResults(@PathVariable Long studentId) {
        return ResponseEntity.ok(resultService.getStudentResults(studentId));
    }

    @GetMapping
    public ResponseEntity<List<Result>> getAllResults() {
        return ResponseEntity.ok(resultService.getAllResults());
    }

    @GetMapping("/exam/{examId}")
    public ResponseEntity<List<Result>> getResultsByExamId(@PathVariable Long examId) {
        return ResponseEntity.ok(resultService.getResultsByExamId(examId));
    }

    @PostMapping("/by-exams")
    public ResponseEntity<List<Result>> getResultsByExamIds(@RequestBody List<Long> examIds) {
        return ResponseEntity.ok(resultService.getResultsByExamIds(examIds));
    }
}
