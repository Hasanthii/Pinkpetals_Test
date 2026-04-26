package com.SmartCommerce.dto;

public record AuthResponseDTO(
        String token,
        UserDTO user
) {
    public AuthResponseDTO(String token, UserDTO user) {
        this.token = token;
        this.user = user;
    }
}
