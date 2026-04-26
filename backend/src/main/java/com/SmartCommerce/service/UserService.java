package com.SmartCommerce.service;

import com.SmartCommerce.dto.*;

import java.util.List;

public interface UserService {

    UserDTO register(RegisterRequestDTO request);

    UserDTO createUserByAdmin(CreateUserByAdminRequestDTO request);

    UserDTO getUserById(Long id);

    UserDTO getUserByEmail(String email);

    List<UserDTO> getAllUsers();

    List<UserDTO> getAllUsersIncludingInactive();

    List<UserDTO> getActiveUsers();

    UserDTO updateUser(Long id, UpdateUserRequestDTO request);

    UserDTO adminUpdateUser(Long id, AdminUpdateUserRequestDTO request);

    void changePassword(Long id, ChangePasswordRequestDTO request);

    void deactivateUser(Long id);

    void activateUser(Long id);

    void deleteUser(Long id);

    List<UserDTO> searchUsersByName(String name);

    List<UserDTO> getUsersByRole(String role);
}
