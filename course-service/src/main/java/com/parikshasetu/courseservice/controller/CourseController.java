package com.parikshasetu.courseservice.controller;

import com.parikshasetu.courseservice.model.Course;
import com.parikshasetu.courseservice.model.CourseEnrollment;
import com.parikshasetu.courseservice.service.CourseService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @PostMapping
    public ResponseEntity<Course> createCourse(@RequestBody Course course) {
        return ResponseEntity.ok(courseService.createCourse(course));
    }

    @GetMapping
    public ResponseEntity<List<Course>> getAllCourses() {
        return ResponseEntity.ok(courseService.getAllCourses());
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<Course>> getTeacherCourses(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getCoursesByTeacher(teacherId));
    }

    @PostMapping("/{id}/enroll/{studentId}")
    public ResponseEntity<?> enroll(@PathVariable Long id, @PathVariable Long studentId) {
        try {
            courseService.enrollStudent(id, studentId);
            return ResponseEntity.ok("Enrolled successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Enrollment failed: " + e.getMessage());
        }
    }

    @GetMapping("/my/{studentId}")
    public ResponseEntity<List<CourseEnrollment>> getMyCourses(@PathVariable Long studentId) {
        return ResponseEntity.ok(courseService.getMyCourses(studentId));
    }

    @GetMapping("/{courseId}/pending")
    public ResponseEntity<List<CourseEnrollment>> getPending(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getPendingEnrollments(courseId));
    }

    @GetMapping("/{courseId}/students")
    public ResponseEntity<List<CourseEnrollment>> getApprovedStudents(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getApprovedEnrollments(courseId));
    }

    @PutMapping("/enrollments/{enrollmentId}/approve")
    public ResponseEntity<Void> approve(@PathVariable Long enrollmentId) {
        courseService.approveEnrollment(enrollmentId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/enrollments/{enrollmentId}/reject")
    public ResponseEntity<Void> reject(@PathVariable Long enrollmentId) {
        courseService.rejectEnrollment(enrollmentId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{courseId}/students/upload")
    public ResponseEntity<String> uploadStudents(@PathVariable Long courseId,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            courseService.bulkEnroll(courseId, file);
            return ResponseEntity.ok("Students enrolled successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Failed to upload students: " + e.getMessage());
        }
    }

    @GetMapping("/template/students")
    public ResponseEntity<org.springframework.core.io.Resource> downloadStudentTemplate() {
        java.io.ByteArrayInputStream in = courseService.generateStudentTemplate();
        org.springframework.core.io.InputStreamResource file = new org.springframework.core.io.InputStreamResource(in);

        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=students_template.xlsx")
                .contentType(org.springframework.http.MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }
}
