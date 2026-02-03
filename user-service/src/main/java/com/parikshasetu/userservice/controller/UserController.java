package com.parikshasetu.userservice.controller;

import com.parikshasetu.userservice.model.User;
import com.parikshasetu.userservice.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/students")
    public List<User> getStudents() {
        return userService.getStudents();
    }

    @GetMapping("/{id}")
    public User getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/profile")
    public User getProfile() {
        // Current user logic - for now return mock or first user if security context
        // not ready
        // In real app, extract from SecurityContextHolder
        // Temporarily throwing error or returning dummy to force frontend to use ID
        // based fetch
        return null;
    }

    @org.springframework.web.bind.annotation.PostMapping("/students/upload")
    public org.springframework.http.ResponseEntity<String> uploadStudents(
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        userService.bulkRegisterStudents(file);
        return org.springframework.http.ResponseEntity.ok("Students uploaded successfully");
    }

    @GetMapping("/students/template")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> downloadStudentTemplate() {
        java.io.ByteArrayInputStream in = userService.generateStudentTemplate();
        org.springframework.core.io.InputStreamResource file = new org.springframework.core.io.InputStreamResource(in);

        return org.springframework.http.ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=students_template.xlsx")
                .contentType(org.springframework.http.MediaType
                        .parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(file);
    }

    @GetMapping("/search/email")
    public org.springframework.http.ResponseEntity<User> getUserByEmail(
            @org.springframework.web.bind.annotation.RequestParam String email) {
        // We need to implement this in service or just use repository here if valid
        // Ideally service. But let's check service first.
        // For now, I'll assume service doesn't have it and add basic logic or find it.
        // Let's verify service first.
        // Actually, let's just use the repo via service stream for now to be safe and
        // quick
        User user = userService.getAllUsers().stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found"));
        return org.springframework.http.ResponseEntity.ok(user);
    }
}
