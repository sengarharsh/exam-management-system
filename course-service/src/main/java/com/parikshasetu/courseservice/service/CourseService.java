package com.parikshasetu.courseservice.service;

import com.parikshasetu.courseservice.model.Course;
import com.parikshasetu.courseservice.model.CourseEnrollment;
import com.parikshasetu.courseservice.repository.CourseEnrollmentRepository;
import com.parikshasetu.courseservice.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public CourseService(CourseRepository courseRepository, CourseEnrollmentRepository enrollmentRepository,
            org.springframework.web.client.RestTemplate restTemplate) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.restTemplate = restTemplate;
    }

    // ... (createCourse, getAllCourses, getCoursesByTeacher, enrollStudent,
    // getMyCourses, getPendingEnrollments methods same as before)

    public Course createCourse(Course course) {
        return courseRepository.save(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public List<Course> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacherId(teacherId);
    }

    public void enrollStudent(Long courseId, Long studentId) {
        if (courseId == null || studentId == null) {
            throw new IllegalArgumentException("Course ID and Student ID cannot be null");
        }
        try {
            if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isEmpty()) {
                CourseEnrollment enrollment = new CourseEnrollment();
                enrollment.setCourseId(courseId);
                enrollment.setStudentId(studentId);
                enrollment.setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.PENDING);
                enrollmentRepository.save(enrollment);
            }
        } catch (Exception e) {
            System.err.println("Error enrolling student: " + e.getMessage());
            throw new RuntimeException("Failed to enroll student: " + e.getMessage());
        }
    }

    public List<CourseEnrollment> getMyCourses(Long studentId) {
        // Return all enrollments so student sees PENDING and APPROVED
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<CourseEnrollment> getPendingEnrollments(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .filter(e -> e.getStatus() == com.parikshasetu.courseservice.model.EnrollmentStatus.PENDING)
                .collect(Collectors.toList());
    }

    public List<CourseEnrollment> getApprovedEnrollments(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .filter(e -> e.getStatus() == com.parikshasetu.courseservice.model.EnrollmentStatus.APPROVED)
                .collect(Collectors.toList());
    }

    public void approveEnrollment(Long enrollmentId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow();
        enrollment.setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.APPROVED);
        enrollmentRepository.save(enrollment);

        // Send Notification
        try {
            Course course = courseRepository.findById(enrollment.getCourseId()).orElse(new Course());
            java.util.Map<String, Object> notification = new java.util.HashMap<>();
            notification.put("userId", enrollment.getStudentId());
            notification.put("message",
                    "Enrollment approved for course: " + (course.getTitle() != null ? course.getTitle() : "Course"));
            restTemplate.postForLocation("http://notification-service/notifications", notification);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    public void deleteCourse(Long courseId) {
        courseRepository.deleteById(courseId);
    }

    public void removeStudent(Long courseId, Long studentId) {
        CourseEnrollment enrollment = enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
        enrollmentRepository.delete(enrollment);
    }

    public void rejectEnrollment(Long enrollmentId) {
        CourseEnrollment enrollment = enrollmentRepository.findById(enrollmentId).orElseThrow();
        enrollment.setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.REJECTED);
        enrollmentRepository.save(enrollment);
    }

    public void bulkEnroll(Long courseId, org.springframework.web.multipart.MultipartFile file) {
        System.out.println("CourseService: bulkEnroll called for course " + courseId);
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(
                file.getInputStream())) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            for (org.apache.poi.ss.usermodel.Row row : sheet) {
                if (row.getRowNum() == 0)
                    continue; // Skip header

                org.apache.poi.ss.usermodel.Cell nameCell = row.getCell(0);
                org.apache.poi.ss.usermodel.Cell emailCell = row.getCell(1);

                if (emailCell != null) {
                    String email = emailCell.getStringCellValue().trim();
                    String fullName = (nameCell != null) ? nameCell.getStringCellValue().trim() : "Student";

                    if (!email.isEmpty()) {
                        try {
                            String userServiceUrl = "http://user-service/api/users/search/email?email=" + email;
                            Long studentId = null;

                            try {
                                // Try to find existing user
                                org.springframework.http.ResponseEntity<java.util.Map> response = restTemplate
                                        .getForEntity(userServiceUrl, java.util.Map.class);
                                if (response.getBody() != null && response.getBody().containsKey("id")) {
                                    studentId = Long.valueOf(response.getBody().get("id").toString());
                                }
                            } catch (org.springframework.web.client.HttpClientErrorException.NotFound e) {
                                // User not found, register them
                                String registerUrl = "http://user-service/api/auth/register";
                                java.util.Map<String, Object> registerRequest = new java.util.HashMap<>();
                                registerRequest.put("fullName", fullName.isEmpty() ? "Student" : fullName);
                                registerRequest.put("email", email);
                                registerRequest.put("password", "123456");
                                registerRequest.put("role", "STUDENT");

                                org.springframework.http.ResponseEntity<java.util.Map> registerResponse = restTemplate
                                        .postForEntity(registerUrl, registerRequest, java.util.Map.class);

                                if (registerResponse.getBody() != null
                                        && registerResponse.getBody().containsKey("id")) {
                                    studentId = Long.valueOf(registerResponse.getBody().get("id").toString());
                                }
                            }

                            if (studentId != null) {
                                if (enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId).isEmpty()) {
                                    CourseEnrollment enrollment = new CourseEnrollment();
                                    enrollment.setCourseId(courseId);
                                    enrollment.setStudentId(studentId);
                                    enrollment
                                            .setStatus(com.parikshasetu.courseservice.model.EnrollmentStatus.APPROVED);
                                    enrollment.setApproved(true);
                                    enrollmentRepository.save(enrollment);
                                }
                            }
                        } catch (Exception e) {
                            System.err.println("Skipping email " + email + ": " + e.getMessage());
                        }
                    }
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to process Excel file: " + e.getMessage());
        }
    }

    public java.io.ByteArrayInputStream generateStudentTemplate() {
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Students");

            // Header Row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Student Full Name");
            headerRow.createCell(1).setCellValue("Student Email");

            // Sample Row
            org.apache.poi.ss.usermodel.Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("John Doe");
            sampleRow.createCell(1).setCellValue("student@example.com");

            workbook.write(out);
            return new java.io.ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }
}
