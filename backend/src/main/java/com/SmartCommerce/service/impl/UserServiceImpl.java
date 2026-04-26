package com.SmartCommerce.service.impl;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.entity.User;
import com.SmartCommerce.exception.BadRequestException;
import com.SmartCommerce.exception.ResourceNotFoundException;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserDTO register(RegisterRequestDTO request) {
        log.info("Registering new user with email: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            log.warn("Registration failed: Email already exists - {}", request.email());
            throw new BadRequestException("Email already exists: " + request.email());
        }

        if (userRepository.existsByUsername(request.username())) {
            log.warn("Registration failed: Username already exists - {}", request.username());
            throw new BadRequestException("Username already exists: " + request.username());
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .role(User.Role.CUSTOMER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {}", savedUser.getId());

        return UserDTO.fromEntity(savedUser);
    }

    @Override
    @Transactional
    public UserDTO createUserByAdmin(CreateUserByAdminRequestDTO request) {
        log.info("Admin creating new user with email: {}", request.email());

        if (userRepository.existsByEmail(request.email())) {
            log.warn("User creation failed: Email already exists - {}", request.email());
            throw new BadRequestException("Email already exists: " + request.email());
        }

        if (userRepository.existsByUsername(request.username())) {
            log.warn("User creation failed: Username already exists - {}", request.username());
            throw new BadRequestException("Username already exists: " + request.username());
        }

        User.Role role;
        try {
            role = User.Role.valueOf(request.role().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid role specified: {}", request.role());
            throw new BadRequestException("Invalid role: " + request.role());
        }

        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .address(request.address())
                .role(role)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User created by admin successfully with ID: {}", savedUser.getId());

        return UserDTO.fromEntity(savedUser);
    }

    @Override
    public UserDTO getUserById(Long id) {
        log.debug("Fetching user by ID: {}", id);

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        return UserDTO.fromEntity(user);
    }

    @Override
    public UserDTO getUserByEmail(String email) {
        log.debug("Fetching user by email: {}", email);

        User user = userRepository.findByEmailAndIsActiveTrue(email)
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", email);
                    return new ResourceNotFoundException("User not found with email: " + email);
                });

        return UserDTO.fromEntity(user);
    }

    @Override
    public List<UserDTO> getAllUsers() {
        log.debug("Fetching all users");

        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getActiveUsers() {
        log.debug("Fetching all active users");

        return userRepository.findAllActiveUsers().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequestDTO request) {
        log.info("Updating user with ID: {}", id);

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName());
        }

        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName());
        }

        if (request.phone() != null) {
            user.setPhone(request.phone());
        }

        if (request.address() != null) {
            user.setAddress(request.address());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully with ID: {}", updatedUser.getId());

        return UserDTO.fromEntity(updatedUser);
    }

    @Override
    @Transactional
    public void changePassword(Long id, ChangePasswordRequestDTO request) {
        log.info("Changing password for user with ID: {}", id);

        User user = userRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            log.warn("Password change failed: Incorrect old password for user ID: {}", id);
            throw new BadRequestException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        log.info("Password changed successfully for user ID: {}", id);
    }

    @Override
    @Transactional
    public void deactivateUser(Long id) {
        log.info("Deactivating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        user.setIsActive(false);
        userRepository.save(user);

        log.info("User deactivated successfully with ID: {}", id);
    }

    @Override
    @Transactional
    public void activateUser(Long id) {
        log.info("Activating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        user.setIsActive(true);
        userRepository.save(user);

        log.info("User activated successfully with ID: {}", id);
    }

    @Override
    public List<UserDTO> searchUsersByName(String name) {
        log.debug("Searching users by name: {}", name);

        return userRepository.searchByName(name).stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserDTO> getUsersByRole(String role) {
        log.debug("Fetching users by role: {}", role);

        try {
            User.Role userRole = User.Role.valueOf(role.toUpperCase());
            return userRepository.findByRoleAndIsActiveTrue(userRole).stream()
                    .map(UserDTO::fromEntity)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            log.warn("Invalid role specified: {}", role);
            throw new BadRequestException("Invalid role: " + role);
        }
    }

    @Override
    public List<UserDTO> getAllUsersIncludingInactive() {
        log.debug("Fetching all users including inactive");

        return userRepository.findAll().stream()
                .map(UserDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserDTO adminUpdateUser(Long id, AdminUpdateUserRequestDTO request) {
        log.info("Admin updating user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        if (request.firstName() != null && !request.firstName().isBlank()) {
            user.setFirstName(request.firstName());
        }

        if (request.lastName() != null && !request.lastName().isBlank()) {
            user.setLastName(request.lastName());
        }

        if (request.phone() != null) {
            user.setPhone(request.phone());
        }

        if (request.address() != null) {
            user.setAddress(request.address());
        }

        if (request.role() != null && !request.role().isBlank()) {
            try {
                User.Role newRole = User.Role.valueOf(request.role().toUpperCase());
                user.setRole(newRole);
            } catch (IllegalArgumentException e) {
                log.warn("Invalid role specified: {}", request.role());
                throw new BadRequestException("Invalid role: " + request.role());
            }
        }

        if (request.isActive() != null) {
            user.setIsActive(request.isActive());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated by admin successfully with ID: {}", updatedUser.getId());

        return UserDTO.fromEntity(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        log.info("Permanently deleting user with ID: {}", id);

        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", id);
                    return new ResourceNotFoundException("User not found with ID: " + id);
                });

        userRepository.delete(user);
        log.info("User permanently deleted with ID: {}", id);
    }
}
