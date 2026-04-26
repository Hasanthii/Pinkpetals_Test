package com.SmartCommerce.controller;

import com.SmartCommerce.dto.AuthResponseDTO;
import com.SmartCommerce.dto.LoginRequestDTO;
import com.SmartCommerce.dto.RegisterRequestDTO;
import com.SmartCommerce.dto.UserDTO;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDTO> register(@Valid @RequestBody RegisterRequestDTO request) {
        log.info("REST request to register user: {}", request.email());
        AuthResponseDTO response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginRequestDTO request) {
        log.info("REST request to login user with identifier: {}", request.email());
        AuthResponseDTO response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        log.info("REST request to get current user: {}", email);
        
        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> new com.SmartCommerce.exception.ResourceNotFoundException("User not found: " + email));
        
        return ResponseEntity.ok(UserDTO.fromEntity(user));
    }
}
