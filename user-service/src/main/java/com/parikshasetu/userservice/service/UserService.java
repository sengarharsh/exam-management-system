package com.parikshasetu.userservice.service;

import com.parikshasetu.userservice.model.User;
import java.util.List;

public interface UserService {
    List<User> getAllUsers();

    User getUserById(Long id);

    List<User> getStudents();

    void deleteUser(Long id);

    User createUser(User user);

    long countUsers();

    long countByRole(com.parikshasetu.userservice.model.Role role);

    void approveUser(Long id);

    void bulkRegisterStudents(org.springframework.web.multipart.MultipartFile file);

    java.io.ByteArrayInputStream generateStudentTemplate();
}
