package com.evcharging.service;

import com.evcharging.dto.AuthDTO;
import com.evcharging.entity.User;
import com.evcharging.exception.BadRequestException;
import com.evcharging.exception.ResourceNotFoundException;
import com.evcharging.repository.UserRepository;
import com.evcharging.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        User.Role assignedRole = User.Role.DRIVER;
        User.OperatorStatus operatorStatus = User.OperatorStatus.NONE;

        if (request.getRole() != null && !request.getRole().trim().isEmpty()) {
            String requested = request.getRole().trim().toUpperCase();
            if ("ADMIN".equals(requested)) {
                throw new BadRequestException("Administrator registration is not permitted via public registration.");
            } else if ("STATION_OPERATOR".equals(requested) || "OPERATOR".equals(requested)) {
                assignedRole = User.Role.STATION_OPERATOR;
                operatorStatus = User.OperatorStatus.PENDING;
            } else if ("DRIVER".equals(requested) || "USER".equals(requested)) {
                assignedRole = User.Role.DRIVER;
                operatorStatus = User.OperatorStatus.NONE;
            }
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(assignedRole)
                .operatorStatus(operatorStatus)
                .build();

        User savedUser = userRepository.save(user);

        String token = tokenProvider.generateTokenFromEmail(savedUser.getEmail());

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .operatorStatus(savedUser.getOperatorStatus().name())
                .build();
    }

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail().trim().toLowerCase(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return AuthDTO.AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole().name())
                .operatorStatus(user.getOperatorStatus() != null ? user.getOperatorStatus().name() : User.OperatorStatus.NONE.name())
                .build();
    }

    public AuthDTO.UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));

        return AuthDTO.UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .operatorStatus(user.getOperatorStatus() != null ? user.getOperatorStatus().name() : User.OperatorStatus.NONE.name())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
