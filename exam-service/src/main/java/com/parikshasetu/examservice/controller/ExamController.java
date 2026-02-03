package com.parikshasetu.examservice.controller;

import com.parikshasetu.examservice.dto.ExamDTO;
import com.parikshasetu.examservice.dto.QuestionDTO;
import com.parikshasetu.examservice.model.Exam;
import com.parikshasetu.examservice.model.Question;
import com.parikshasetu.examservice.service.ExamService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @PostMapping
    public ResponseEntity<Exam> createExam(@RequestBody ExamDTO dto) {
        return ResponseEntity.ok(examService.createExam(dto));
    }

    @GetMapping
    public ResponseEntity<List<Exam>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id));
    }

    @PostMapping("/questions")
    public ResponseEntity<Question> addQuestion(@RequestBody QuestionDTO dto) {
        return ResponseEntity.ok(examService.addQuestion(dto));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Exam>> getExamsByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(examService.getExamsByTeacher(teacherId));
    }

    @PostMapping("/{examId}/enroll/{studentId}")
    public ResponseEntity<Void> enrollStudent(@PathVariable Long examId, @PathVariable Long studentId) {
        examService.enrollStudent(examId, studentId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<Exam>> getStudentExams(@PathVariable Long studentId) {
        return ResponseEntity.ok(examService.getExamsForStudent(studentId));
    }

    @PostMapping("/by-courses")
    public ResponseEntity<List<Exam>> getExamsByCourses(@RequestBody List<Long> courseIds) {
        return ResponseEntity.ok(examService.getExamsForCourses(courseIds));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/parse-questions")
    public ResponseEntity<List<QuestionDTO>> parseQuestions(
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return ResponseEntity.ok(examService.parseQuestionsFromExcel(file));
    }

    @GetMapping("/template")
    public ResponseEntity<org.springframework.core.io.Resource> downloadTemplate() {
        java.io.ByteArrayInputStream in = examService.generateQuestionTemplate();
        org.springframework.core.io.InputStreamResource file = new org.springframework.core.io.InputStreamResource(in);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=questions_template.xlsx")
                .contentType(org.springframework.http.MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
}
