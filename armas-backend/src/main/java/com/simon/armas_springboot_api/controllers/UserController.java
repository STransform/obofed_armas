package com.simon.armas_springboot_api.controllers;

import com.simon.armas_springboot_api.dto.UserDTO;
import com.simon.armas_springboot_api.dto.UserRequest;
import com.simon.armas_springboot_api.dto.PasswordChangeRequest;
import com.simon.armas_springboot_api.exception.UserAlreadyExistException;
import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.DirectorateRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.security.services.RoleService;
import com.simon.armas_springboot_api.security.repositories.RoleRepository;
import com.simon.armas_springboot_api.services.UserService;
import com.simon.armas_springboot_api.dto.PasswordResetRequest;
import org.springframework.http.HttpStatus;
import java.security.Principal;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.apache.commons.lang3.StringUtils; // Import StringUtils for string validation
import org.springframework.web.bind.annotation.CrossOrigin;
//import Map
import java.util.Map;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@RestController
@RequestMapping("/users")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"},
             methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS},
             allowedHeaders = {"Authorization", "Content-Type", "*"},
             allowCredentials = "true")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;
    private final RoleService roleService;
    private final OrganizationRepository organizationRepository;
    private final DirectorateRepository directorateRepository;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserController(UserService userService, RoleService roleService,
                          OrganizationRepository organizationRepository,
                          DirectorateRepository directorateRepository,
                          RoleRepository roleRepository,
                          UserRepository userRepository) {
        this.userService = userService;
        this.roleService = roleService;
        this.organizationRepository = organizationRepository;
        this.directorateRepository = directorateRepository;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userRepository.findAllWithOrganizationsAndDirectorates().stream()
            .map(userService::convertToDTO) // Use userService.convertToDTO
            .collect(Collectors.toList());
    }
    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER', 'ADMIN', 'USER')")
    public ResponseEntity<UserDTO> getCurrentUser(Principal principal) {
        User user = userService.getUserByUsername(principal.getName());
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(userService.convertToDTO(user));
    }
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public UserDTO getUserById(@PathVariable Long id) {
        User user = userRepository.findByIdWithRelations(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found: " + id));
        return userService.convertToDTO(user); // Use userService.convertToDTO
    }

   @PostMapping
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> createUser(@RequestBody UserRequest userRequest) {
    logger.info("Creating user: {}, password: {}", userRequest.getUsername(), userRequest.getPassword());
    try {
        // Validate password
        if (StringUtils.isBlank(userRequest.getPassword()) || StringUtils.isBlank(userRequest.getConfirmPassword())) {
            logger.warn("Password or confirm password is empty for user: {}", userRequest.getUsername());
            return ResponseEntity.badRequest().body(Map.of("error", "Password and confirm password are required"));
        }
        if ("admin".equals(userRequest.getPassword())) {
            logger.warn("Attempt to use restricted password for user: {}", userRequest.getUsername());
            return ResponseEntity.badRequest().body(Map.of("error", "Password cannot be 'admin'"));
        }
        if (!userRequest.getPassword().equals(userRequest.getConfirmPassword())) {
            logger.warn("Password and confirm password do not match for user: {}", userRequest.getUsername());
            return ResponseEntity.badRequest().body(Map.of("error", "Password and confirm password do not match"));
        }
        if (StringUtils.isBlank(userRequest.getUsername())) {
            logger.warn("Username is empty");
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }

        User user = new User();
        user.setFirstName(userRequest.getFirstName());
        user.setLastName(userRequest.getLastName());
        user.setUsername(userRequest.getUsername());
        user.setPassword(userRequest.getPassword());
        user.setConfirmPassword(userRequest.getConfirmPassword());

        // Handle organization
        if (StringUtils.isNotBlank(userRequest.getOrganizationId())) {
            Organization org = organizationRepository.findById(userRequest.getOrganizationId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + userRequest.getOrganizationId()));
            user.setOrganization(org);
        }

        // Handle directorate
        if (StringUtils.isNotBlank(userRequest.getDirectorateId())) {
            Directorate dir = directorateRepository.findById(userRequest.getDirectorateId())
                .orElseThrow(() -> new IllegalArgumentException("Directorate not found: " + userRequest.getDirectorateId()));
            user.setDirectorate(dir);
        }

        String role = userRequest.getRole();
        if (role == null || (!role.equals("ADMIN") && !role.equals("USER"))) {
            role = "USER";
        }
        User registeredUser = userService.register(user, role);
        logger.info("User registered successfully: {}", registeredUser.getUsername());
        return ResponseEntity.status(201).body(userService.convertToDTO(registeredUser));
    } catch (UserAlreadyExistException e) {
        logger.warn("User registration failed: {}", e.getMessage());
        return ResponseEntity.status(409).body(Map.of("error", "User already exists: " + e.getMessage()));
    } catch (IllegalArgumentException e) {
        logger.warn("Invalid request: {}", e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
        logger.error("Unexpected error during user registration", e);
        return ResponseEntity.status(500).body(Map.of("error", "Failed to register user: " + e.getMessage()));
    }
}

 @PutMapping("/{id}")
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody UserDTO userDTO) {
    logger.info("Updating user with ID: {}", id);
    try {
        // Validate input
        if (StringUtils.isBlank(userDTO.getUsername())) {
            logger.warn("Username is empty for user ID: {}", id);
            return ResponseEntity.badRequest().body(Map.of("error", "Username is required"));
        }
        if (StringUtils.isBlank(userDTO.getFirstName())) {
            logger.warn("First name is empty for user ID: {}", id);
            return ResponseEntity.badRequest().body(Map.of("error", "First name is required"));
        }
        if (StringUtils.isBlank(userDTO.getLastName())) {
            logger.warn("Last name is empty for user ID: {}", id);
            return ResponseEntity.badRequest().body(Map.of("error", "Last name is required"));
        }

        // Convert DTO to entity
        User user = new User();
        user.setId(id);
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setUsername(userDTO.getUsername());

        // Handle organization
        if (userDTO.getOrganization() != null && StringUtils.isNotBlank(userDTO.getOrganization().getId())) {
            Organization org = organizationRepository.findById(userDTO.getOrganization().getId())
                .orElseThrow(() -> new IllegalArgumentException("Organization not found: " + userDTO.getOrganization().getId()));
            user.setOrganization(org);
        } else {
            user.setOrganization(null);
        }

        // Handle directorate
        if (userDTO.getDirectorate() != null && StringUtils.isNotBlank(userDTO.getDirectorate().getId())) {
            Directorate dir = directorateRepository.findById(userDTO.getDirectorate().getId())
                .orElseThrow(() -> new IllegalArgumentException("Directorate not found: " + userDTO.getDirectorate().getId()));
            user.setDirectorate(dir);
        } else {
            user.setDirectorate(null);
        }

        // Handle password if provided
        if (StringUtils.isNotBlank(userDTO.getPassword())) {
            if (!userDTO.getPassword().equals(userDTO.getConfirmPassword())) {
                logger.warn("Password and confirm password do not match for user ID: {}", id);
                return ResponseEntity.badRequest().body(Map.of("error", "Password and confirm password do not match"));
            }
            if ("admin".equals(userDTO.getPassword())) {
                logger.warn("Attempt to use restricted password for user ID: {}", id);
                return ResponseEntity.badRequest().body(Map.of("error", "Password cannot be 'admin'"));
            }
            user.setPassword(userDTO.getPassword());
            user.setConfirmPassword(userDTO.getConfirmPassword());
        }

        User updatedUser = userService.save(user);
        return ResponseEntity.ok(userService.convertToDTO(updatedUser));
    } catch (IllegalArgumentException e) {
        logger.warn("Invalid request for updating user ID {}: {}", id, e.getMessage());
        return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
    } catch (UserAlreadyExistException e) {
        logger.warn("Username already exists for user ID {}: {}", id, e.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", "Username already exists: " + e.getMessage()));
    } catch (Exception e) {
        logger.error("Unexpected error updating user ID {}: {}", id, e.getMessage(), e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "Failed to update user: " + e.getMessage()));
    }
}

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        UserDTO existingUser = userService.getUserById(id);
        if (existingUser != null) {
            userService.deleteUser(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

@PostMapping("/change-password")
@PreAuthorize("hasAnyRole('SENIOR_AUDITOR', 'APPROVER', 'ARCHIVER', 'ADMIN', 'USER')")
public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
    logger.info("Password change request received");
    try {
        // Retrieve username from authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || authentication.getName() == null) {
            logger.warn("No authenticated user found. Authentication: {}", authentication);
            return ResponseEntity.status(401).body("User not authenticated");
        }
        String username = authentication.getName();
        logger.info("Authenticated username: {}", username);
        request.setUsername(username); // Set username in the request
        userService.changePassword(request);
        logger.info("Password changed successfully for user: {}", username);
        return ResponseEntity.ok("Password changed successfully");
    } catch (IllegalArgumentException e) {
        logger.warn("Password change failed: {}", e.getMessage());
        return ResponseEntity.badRequest().body(e.getMessage());
    } catch (Exception e) {
        logger.error("Unexpected error during password change", e);
        return ResponseEntity.status(500).body("Failed to change password: " + e.getMessage());
    }
}
 @PostMapping("/{userId}/reset-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> resetPassword(
            @PathVariable Long userId,
            @RequestBody PasswordResetRequest request) {
        try {
            userService.resetUserPassword(userId, request.getNewPassword(), request.getConfirmPassword());
            return ResponseEntity.ok().body(Map.of("message", "Password reset successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to reset password: " + e.getMessage()));
        }
    }
}