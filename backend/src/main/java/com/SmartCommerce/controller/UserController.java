package com.SmartCommerce.controller;

import com.SmartCommerce.dto.*;
import com.SmartCommerce.repository.UserRepository;
import com.SmartCommerce.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        log.info("REST request to get all users");
        List<UserDTO> users = userService.getAllUsersIncludingInactive();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/active")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getActiveUsers() {
        log.info("REST request to get all active users");
        List<UserDTO> users = userService.getActiveUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id, Authentication authentication) {
        log.info("REST request to get user by ID: {}", id);
        
        String currentEmail = authentication.getName();
        String currentRole = getCurrentUserRole();
        
        if (!"ADMIN".equals(currentRole) && !currentEmail.equals(userService.getUserById(id).email())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        UserDTO user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    @GetMapping("/email/{email}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getUserByEmail(@PathVariable String email) {
        log.info("REST request to get user by email: {}", email);
        UserDTO user = userService.getUserByEmail(email);
        return ResponseEntity.ok(user);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody CreateUserByAdminRequestDTO request) {
        log.info("REST request to create user by admin: {}", request.email());
        UserDTO user = userService.createUserByAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDTO> adminUpdateUser(@PathVariable Long id, 
                                                   @Valid @RequestBody AdminUpdateUserRequestDTO request) {
        log.info("REST request for admin to update user by ID: {}", id);
        UserDTO updatedUser = userService.adminUpdateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, 
                                               @Valid @RequestBody UpdateUserRequestDTO request,
                                               Authentication authentication) {
        log.info("REST request to update user by ID: {}", id);
        
        String currentEmail = authentication.getName();
        String currentRole = getCurrentUserRole();
        
        if (!"ADMIN".equals(currentRole) && !currentEmail.equals(userService.getUserById(id).email())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        UserDTO updatedUser = userService.updateUser(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/{id}/password")
    public ResponseEntity<Void> changePassword(@PathVariable Long id,
                                                @Valid @RequestBody ChangePasswordRequestDTO request,
                                                Authentication authentication) {
        log.info("REST request to change password for user ID: {}", id);
        
        String currentEmail = authentication.getName();
        String currentRole = getCurrentUserRole();
        
        if (!"ADMIN".equals(currentRole) && !currentEmail.equals(userService.getUserById(id).email())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        userService.changePassword(id, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        log.info("REST request to delete user ID: {}", id);
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> activateUser(@PathVariable Long id) {
        log.info("REST request to activate user ID: {}", id);
        userService.activateUser(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> searchUsers(@RequestParam String name) {
        log.info("REST request to search users by name: {}", name);
        List<UserDTO> users = userService.searchUsersByName(name);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        log.info("REST request to get users by role: {}", role);
        List<UserDTO> users = userService.getUsersByRole(role);
        return ResponseEntity.ok(users);
    }

    private String getCurrentUserRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getAuthorities() != null) {
            return authentication.getAuthorities().stream()
                    .findFirst()
                    .map(auth -> auth.getAuthority().replace("ROLE_", ""))
                    .orElse("CUSTOMER");
        }
        return "CUSTOMER";
    }
}
