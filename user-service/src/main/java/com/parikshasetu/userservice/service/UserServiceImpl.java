package com.parikshasetu.userservice.service;

import com.parikshasetu.userservice.model.User;
import com.parikshasetu.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.IOException;
import java.util.Iterator;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final org.springframework.web.client.RestTemplate restTemplate;

    public UserServiceImpl(UserRepository userRepository,
            org.springframework.security.crypto.password.PasswordEncoder passwordEncoder,
            org.springframework.web.client.RestTemplate restTemplate) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.restTemplate = restTemplate;
    }

    // ... (getAllUsers, getUserById, getStudents, deleteUser, createUser,
    // countUsers, countByRole)

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    public User getUserById(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("ID cannot be null");
        }
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public List<User> getStudents() {
        return userRepository.findByRole(com.parikshasetu.userservice.model.Role.STUDENT);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    public User createUser(User user) {
        return userRepository.save(user);
    }

    @Override
    public long countUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.getStatus() == com.parikshasetu.userservice.model.Status.APPROVED)
                .count();
    }

    @Override
    public long countByRole(com.parikshasetu.userservice.model.Role role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole() == role && u.getStatus() == com.parikshasetu.userservice.model.Status.APPROVED)
                .count();
    }

    @Override
    public void approveUser(Long id) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        user.setStatus(com.parikshasetu.userservice.model.Status.APPROVED);
        userRepository.save(user);

        // Send Notification
        try {
            java.util.Map<String, Object> notification = new java.util.HashMap<>();
            notification.put("userId", id);
            notification.put("message", "Your account has been approved by the Admin!");
            restTemplate.postForLocation("http://notification-service/notifications", notification);
        } catch (Exception e) {
            System.err.println("Failed to send notification: " + e.getMessage());
        }
    }

    @Override
    public void bulkRegisterStudents(MultipartFile file) {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            Iterator<Row> rows = sheet.iterator();

            // Skip header row
            if (rows.hasNext()) {
                rows.next();
            }

            while (rows.hasNext()) {
                Row currentRow = rows.next();
                try {
                    // Cell 0: Full Name, Cell 1: Email, Cell 2: Password
                    String fullName = getCellValue(currentRow.getCell(0));
                    String email = getCellValue(currentRow.getCell(1));
                    String passwordRaw = getCellValue(currentRow.getCell(2));

                    if (email == null || email.isEmpty() || userRepository.existsByEmail(email)) {
                        continue;
                    }

                    if (passwordRaw == null || passwordRaw.isEmpty()) {
                        passwordRaw = "123456";
                    }

                    User user = new User();
                    user.setFullName(fullName);
                    user.setEmail(email);
                    user.setPassword(passwordEncoder.encode(passwordRaw));
                    user.setRole(com.parikshasetu.userservice.model.Role.STUDENT);
                    user.setStatus(com.parikshasetu.userservice.model.Status.APPROVED);
                    user.setVerified(true);

                    userRepository.save(user);
                } catch (Exception e) {
                    System.err.println("Error processing row: " + e.getMessage());
                }
            }
        } catch (IOException e) {
            throw new RuntimeException("Failed to parse Excel file: " + e.getMessage());
        }
    }

    private String getCellValue(Cell cell) {
        if (cell == null)
            return "";
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                return String.valueOf((int) cell.getNumericCellValue());
            default:
                return "";
        }
    }

    @Override
    public java.io.ByteArrayInputStream generateStudentTemplate() {
        try (Workbook workbook = new XSSFWorkbook();
                java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Students");

            // Header Row
            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("Full Name");
            headerRow.createCell(1).setCellValue("Email");
            headerRow.createCell(2).setCellValue("Password");

            // Sample Row
            Row sampleRow = sheet.createRow(1);
            sampleRow.createCell(0).setCellValue("John Doe");
            sampleRow.createCell(1).setCellValue("student@example.com");
            sampleRow.createCell(2).setCellValue("password123");

            workbook.write(out);
            return new java.io.ByteArrayInputStream(out.toByteArray());
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate template: " + e.getMessage());
        }
    }
}
