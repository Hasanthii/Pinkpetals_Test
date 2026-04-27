package com.SmartCommerce.config;

import com.SmartCommerce.entity.User;
import com.SmartCommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@pinkpetals.com")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@pinkpetals.com")
                    .password(passwordEncoder.encode("admin123"))
                    .firstName("Admin")
                    .lastName("User")
                    .phone("0771234567")
                    .address("PinkPetals HQ")
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .build();
            
            userRepository.save(admin);
            log.info("Default admin user created: username=admin, email=admin@pinkpetals.com, password=admin123");
        }
    }
}
