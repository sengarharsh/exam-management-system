package com.parikshasetu.examservice.service;

import com.parikshasetu.examservice.dto.ExamDTO;
import com.parikshasetu.examservice.dto.QuestionDTO;
import com.parikshasetu.examservice.model.Exam;
import com.parikshasetu.examservice.model.Question;
import com.parikshasetu.examservice.repository.ExamRepository;
import com.parikshasetu.examservice.repository.QuestionRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final QuestionRepository questionRepository;
    private final com.parikshasetu.examservice.repository.EnrollmentRepository enrollmentRepository;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public ExamService(ExamRepository examRepository, QuestionRepository questionRepository,
            com.parikshasetu.examservice.repository.EnrollmentRepository enrollmentRepository,
            org.springframework.web.client.RestTemplate restTemplate) {
        this.examRepository = examRepository;
        this.questionRepository = questionRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.restTemplate = restTemplate;
    }

    public Exam createExam(ExamDTO dto) {
        Exam exam = new Exam();
        exam.setTitle(dto.getTitle());
        exam.setDescription(dto.getDescription());
        exam.setDurationMinutes(dto.getDurationMinutes());
        exam.setTotalMarks(dto.getTotalMarks());
        exam.setTeacherId(dto.getTeacherId());
        exam.setCourseId(dto.getCourseId());
        exam.setScheduledTime(dto.getScheduledTime());
        exam.setStartTime(dto.getStartTime());
        exam.setEndTime(dto.getEndTime());
        exam.setActive(true);

        Exam savedExam = examRepository.save(exam);

        if (dto.getQuestions() != null && !dto.getQuestions().isEmpty()) {
            for (QuestionDTO qDto : dto.getQuestions()) {
                Question question = new Question();
                question.setText(qDto.getText());
                question.setOptionA(qDto.getOptionA());
                question.setOptionB(qDto.getOptionB());
                question.setOptionC(qDto.getOptionC());
                question.setOptionD(qDto.getOptionD());
                question.setCorrectOption(qDto.getCorrectOption());
                question.setMarks(qDto.getMarks());
                question.setExam(savedExam);
                questionRepository.save(question);
            }
        }
        return savedExam;
    }

    // NEW: Fetch exams for a student based on Course Enrollments + Direct
    // Enrollments
    public List<Exam> getExamsForStudent(Long studentId) {
        // 1. Get Direct Enrollments (Legacy support)
        List<Long> directExamIds = enrollmentRepository.findByStudentId(studentId)
                .stream().map(enrollment -> enrollment.getExamId()).toList();

        List<Exam> exams = examRepository.findAllById(directExamIds);

        // 2. Fetch Course Enrollments from Course Service
        try {
            // We need a DTO to map the response, or just use Object/Map
            // Response is List<CourseEnrollment>
            // Ideally we use a shared DTO lib or duplicate the DTO class.
            // For quick prototype, we can map to a local DTO or use raw List<Map>.
            @SuppressWarnings("unchecked")
            List<java.util.Map<String, Object>> courseEnrollments = restTemplate.getForObject(
                    "http://course-service/api/courses/my/" + studentId, List.class);

            if (courseEnrollments != null) {
                List<Long> courseIds = courseEnrollments.stream()
                        .filter(e -> Boolean.TRUE.equals(e.get("approved"))) // Check if approved
                        .map(e -> ((Number) e.get("courseId")).longValue())
                        .collect(java.util.stream.Collectors.toList());

                if (!courseIds.isEmpty()) {
                    List<Exam> courseExams = examRepository.findByCourseIdIn(courseIds);
                    exams.addAll(courseExams);
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch course enrollments: " + e.getMessage());
            // Fail gracefully, return what we have
        }

        // Remove duplicates if any
        return exams.stream().distinct().collect(java.util.stream.Collectors.toList());
    }

    public List<Exam> getExamsForCourses(List<Long> courseIds) {
        if (courseIds == null || courseIds.isEmpty()) {
            return List.of();
        }
        return examRepository.findByCourseIdIn(courseIds);
    }

    public Question addQuestion(QuestionDTO dto) {
        Exam exam = examRepository.findById(dto.getExamId())
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        Question question = new Question();
        question.setText(dto.getText());
        question.setOptionA(dto.getOptionA());
        question.setOptionB(dto.getOptionB());
        question.setOptionC(dto.getOptionC());
        question.setOptionD(dto.getOptionD());
        question.setCorrectOption(dto.getCorrectOption());
        question.setMarks(dto.getMarks());
        question.setExam(exam);

        return questionRepository.save(question);
    }

    public List<Exam> getAllExams() {
        return examRepository.findByActiveTrue();
    }

    public List<Exam> getExamsByTeacher(Long teacherId) {
        return examRepository.findByTeacherId(teacherId);
    }

    public Exam getExamById(Long id) {
        Exam exam = examRepository.findById(id).orElseThrow(() -> new RuntimeException("Exam not found"));
        // Randomly shuffle questions for every fetch (Student view)
        // Note: For Teacher view in edit mode this might be annoying, but acceptable
        // for now
        java.util.Collections.shuffle(exam.getQuestions());
        return exam;
    }

    public void enrollStudent(Long examId, Long studentId) {
        if (!enrollmentRepository.existsByStudentIdAndExamId(studentId, examId)) {
            com.parikshasetu.examservice.model.Enrollment enrollment = new com.parikshasetu.examservice.model.Enrollment();
            enrollment.setExamId(examId);
            enrollment.setStudentId(studentId);
            enrollmentRepository.save(enrollment);
        }
    }

    public void deleteExam(Long id) {
        examRepository.deleteById(id);
    }

    public List<QuestionDTO> parseQuestionsFromExcel(org.springframework.web.multipart.MultipartFile file) {
        List<QuestionDTO> questions = new java.util.ArrayList<>();
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook(
                file.getInputStream())) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
            java.util.Iterator<org.apache.poi.ss.usermodel.Row> rows = sheet.iterator();

            // Skip header
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                org.apache.poi.ss.usermodel.Row currentRow = rows.next();
                try {
                    // Columns: 0:Text, 1:A, 2:B, 3:C, 4:D, 5:Correct(A/B/C/D), 6:Marks(Opt)
                    String text = getCellValue(currentRow.getCell(0));
                    if (text == null || text.trim().isEmpty())
                        continue;

                    QuestionDTO q = new QuestionDTO();
                    q.setText(text);
                    q.setOptionA(getCellValue(currentRow.getCell(1)));
                    q.setOptionB(getCellValue(currentRow.getCell(2)));
                    q.setOptionC(getCellValue(currentRow.getCell(3)));
                    q.setOptionD(getCellValue(currentRow.getCell(4)));

                    String correct = getCellValue(currentRow.getCell(5));
                    if (correct != null)
                        correct = correct.trim().toUpperCase();
                    // Validate A,B,C,D
                    if (correct != null && (correct.equals("A") || correct.equals("B") || correct.equals("C")
                            || correct.equals("D"))) {
                        q.setCorrectOption(correct);
                    } else {
                        q.setCorrectOption("A"); // Default or error
                    }

                    String marksStr = getCellValue(currentRow.getCell(6));
                    int marks = -1; // -1 indicates not set
                    if (marksStr != null && !marksStr.isEmpty()) {
                        try {
                            // Can be "5.0"
                            double d = Double.parseDouble(marksStr);
                            marks = (int) d;
                        } catch (Exception e) {
                            // ignore
                        }
                    }
                    if (marks > 0) {
                        q.setMarks(marks);
                    } else {
                        q.setMarks(null); // Let frontend set default
                    }

                    questions.add(q);
                } catch (Exception e) {
                    System.err.println("Skipping row: " + e.getMessage());
                }
            }
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
        return questions;
    }

    public java.io.ByteArrayInputStream generateQuestionTemplate() {
        try (org.apache.poi.ss.usermodel.Workbook workbook = new org.apache.poi.xssf.usermodel.XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            org.apache.poi.ss.usermodel.Sheet sheet = workbook.createSheet("Questions");

            // Header Row
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] columns = { "Question Text", "Option A", "Option B", "Option C", "Option D",
                    "Correct Option (A/B/C/D)", "Marks (Optional)" };
            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            // Sample Row
            org.apache.poi.ss.usermodel.Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("What is 2 + 2?");
            sampleRow.createCell(1).setCellValue("3");
            sampleRow.createCell(2).setCellValue("4");
            sampleRow.createCell(3).setCellValue("5");
            sampleRow.createCell(4).setCellValue("6");
            sampleRow.createCell(5).setCellValue("B");
            sampleRow.createCell(6).setCellValue(5);

            workbook.write(out);
            return new java.io.ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }

    private String getCellValue(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf(cell.getNumericCellValue()); // May return "5.0"
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                return cell.getCellFormula();
            default:
                return "";
        }
    }
}
