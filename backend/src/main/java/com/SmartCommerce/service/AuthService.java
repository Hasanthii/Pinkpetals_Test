package com.SmartCommerce.service;

import com.SmartCommerce.dto.AuthResponseDTO;
import com.SmartCommerce.dto.LoginRequestDTO;
import com.SmartCommerce.dto.RegisterRequestDTO;

public interface AuthService {

    AuthResponseDTO register(RegisterRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);

    String generateToken(Long userId, String email, String role);

    boolean validateToken(String token);
}
