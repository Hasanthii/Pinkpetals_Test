package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.AuthResponseDTO;
import com.SmartCommerce.dto.LoginRequestDTO;
import com.SmartCommerce.dto.RegisterRequestDTO;
import com.SmartCommerce.dto.UserDTO;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.security.JwtUtils;
import com.SmartCommerce.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public AuthResponseDTO register(RegisterRequestDTO request) {
        log.info("Processing registration for email: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            log.warn("Registration failed: Email already exists - {}", request.email());
            throw new BadRequestException("Email already exists: " + request.email());
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Registration failed: Invalid role - {}", request.role());
            throw new BadRequestException("Invalid role. Must be CUSTOMER or SUPPLIER");
        }

        if (role == User.Role.ADMIN || role == User.Role.SUPPORT_STAFF) {
            log.warn("Registration failed: Cannot register with role - {}", request.role());
            throw new BadRequestException("You cannot register with this role through this form.");
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .role(role)
                .isActive(true)
                .build();

        User savedUser = Objects.requireNonNull(
                userRepository.save(Objects.requireNonNull(user, "User cannot be null")),
                "Saved user cannot be null"
        );
        log.info("User registered successfully with ID: {}", savedUser.getId());

        String token = generateToken(savedUser.getId(), savedUser.getEmail(), savedUser.getRole().name());
        UserDTO userDTO = UserDTO.fromEntity(savedUser);

        return new AuthResponseDTO(token, userDTO);
    }

    @Override
    public AuthResponseDTO login(LoginRequestDTO request) {
        String loginIdentifier = request.email().trim();
        log.info("Processing login for identifier: {}", loginIdentifier);

        User user = userRepository.findByEmailAndIsActiveTrue(loginIdentifier)
                .or(() -> userRepository.findByUsernameAndIsActiveTrue(loginIdentifier))
                .orElseThrow(() -> {
                    log.warn("Login failed: User not found or inactive - {}", loginIdentifier);
                    return new BadRequestException("Invalid username/email or password");
                });

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("Login failed: Incorrect password for identifier - {}", loginIdentifier);
            throw new BadRequestException("Invalid username/email or password");
        }

        String token = generateToken(user.getId(), user.getEmail(), user.getRole().name());
        UserDTO userDTO = UserDTO.fromEntity(user);

        log.info("User logged in successfully: {}", user.getEmail());

        return new AuthResponseDTO(token, userDTO);
    }

    @Override
    public String generateToken(Long userId, String email, String role) {
        log.debug("Generating JWT token for user ID: {}", userId);
        return jwtUtils.generateToken(userId, email, role);
    }

    @Override
    public boolean validateToken(String token) {
        return jwtUtils.validateJwtToken(token);
    }
}
