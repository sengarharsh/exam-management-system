package com.parikshasetu.userservice.service;

import com.parikshasetu.userservice.config.JwtService;
import com.parikshasetu.userservice.config.CustomUserDetails;
import com.parikshasetu.userservice.dto.AuthResponse;
import com.parikshasetu.userservice.dto.LoginRequest;
import com.parikshasetu.userservice.dto.RegisterRequest;
import com.parikshasetu.userservice.model.User;
import com.parikshasetu.userservice.repository.UserRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setVerified(false);

        // Auto-approve Students, but Teachers need approval
        if (request.getRole() == com.parikshasetu.userservice.model.Role.TEACHER) {
            user.setStatus(com.parikshasetu.userservice.model.Status.PENDING);
            user.setVerified(false);
        } else {
            user.setStatus(com.parikshasetu.userservice.model.Status.APPROVED);
            user.setVerified(true);
        }

        userRepository.save(user);

        // Generate tokens
        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(user.getId(), accessToken, refreshToken, user.getRole().name(), user.getEmail(),
                user.getFullName());

    }

    public AuthResponse login(LoginRequest request) {
        // First fetch user to check status BEFORE authentication (or after, but better
        // before/during)
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getStatus() != com.parikshasetu.userservice.model.Status.APPROVED) {
            throw new RuntimeException("Account is " + user.getStatus() + ". Please wait for admin approval.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()));

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String accessToken = jwtService.generateToken(userDetails);
        String refreshToken = jwtService.generateRefreshToken(userDetails);

        return new AuthResponse(user.getId(), accessToken, refreshToken, user.getRole().name(), user.getEmail(),
                user.getFullName());

    }

    public void changePassword(com.parikshasetu.userservice.dto.ChangePasswordRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
