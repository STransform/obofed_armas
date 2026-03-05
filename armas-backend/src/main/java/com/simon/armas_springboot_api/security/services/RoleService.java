package com.simon.armas_springboot_api.security.services;

import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.security.models.Privilege;
import com.simon.armas_springboot_api.security.models.Role;
import com.simon.armas_springboot_api.security.repositories.PrivilegeRepository;
import com.simon.armas_springboot_api.security.repositories.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;



import java.util.Arrays;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import java.util.Set;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
@Service
@Transactional
public class RoleService {
    private static final Logger logger = LoggerFactory.getLogger(RoleService.class);
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PrivilegeRepository privilegeRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public RoleService(RoleRepository roleRepository, UserRepository userRepository,
                       PrivilegeRepository privilegeRepository) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.privilegeRepository = privilegeRepository;
    }

    @Transactional
    public void initializeRolesAndPrivileges() {
        // Initialize privileges
        List<String> privilegeNames = Arrays.asList(
                "CREATE_PRODUCT", "VIEW_LETTERS", "READ", "WRITE", "CREATE", "DELETE",
                "REVIEW_REPORTS", "ASSIGN_REPORTS", "APPROVE_REPORTS"
        );
        for (String name : privilegeNames) {
            if (privilegeRepository.findByDescription(name) == null) {
                Privilege privilege = new Privilege();
                privilege.setDescription(name);
                privilegeRepository.saveAndFlush(privilege);
                logger.info("Created privilege: {}", name);
            } else {
                logger.debug("Privilege {} already exists", name);
            }
        }

        // Define roles and their privileges
        List<RoleConfig> roleConfigs = Arrays.asList(
                new RoleConfig("ADMIN", "Administrator with full access", privilegeRepository.findAll()),
                new RoleConfig("USER", "Standard user with view access",
                        privilegeRepository.findAll().stream()
                                .filter(p -> p.getDescription().startsWith("VIEW_") || p.getDescription().equals("READ"))
                                .collect(Collectors.toList())),
                new RoleConfig("SENIOR_AUDITOR", "Senior auditor with review privileges",
                        privilegeRepository.findAll().stream()
                                .filter(p -> p.getDescription().equals("REVIEW_REPORTS"))
                                .collect(Collectors.toList())),
                new RoleConfig("ARCHIVER", "Archiver with assignment privileges",
                        privilegeRepository.findAll().stream()
                                .filter(p -> p.getDescription().equals("ASSIGN_REPORTS"))
                                .collect(Collectors.toList())),
                new RoleConfig("APPROVER", "Approver with approval/rejection privileges",
                        privilegeRepository.findAll().stream()
                                .filter(p -> p.getDescription().equals("APPROVE_REPORTS"))
                                .collect(Collectors.toList())),
                new RoleConfig("MANAGER", "Manager with letter viewing privileges",
                        privilegeRepository.findAll().stream()
                                .filter(p -> p.getDescription().equals("VIEW_LETTERS"))
                                .collect(Collectors.toList()))
        );

        for (RoleConfig config : roleConfigs) {
            List<Role> existingRoles = roleRepository.findByDescription(config.description);
            Role role;

            if (existingRoles.isEmpty()) {
                // Create new role
                logger.info("Creating new role: {}", config.description);
                role = new Role();
                role.setDescription(config.description);
                role.setDetails(config.details);
                role.setPrivileges(new ArrayList<>());
                roleRepository.saveAndFlush(role);
            } else {
                // Use the first role and delete duplicates
                role = existingRoles.get(0);
                logger.info("Role {} already exists, using ID: {}", config.description, role.getId());
                if (existingRoles.size() > 1) {
                    logger.warn("Found {} duplicate roles for description: {}", existingRoles.size() - 1, config.description);
                    for (int i = 1; i < existingRoles.size(); i++) {
                        roleRepository.delete(existingRoles.get(i));
                        logger.info("Deleted duplicate role: {} with ID: {}", config.description, existingRoles.get(i).getId());
                    }
                }
            }

            // Clear existing privileges
            List<Privilege> currentPrivileges = role.getPrivileges() != null ? new ArrayList<>(role.getPrivileges()) : new ArrayList<>();
            if (!currentPrivileges.isEmpty()) {
                // Update role_id to null in the database
                Query query = entityManager.createQuery("UPDATE Privilege p SET p.role = null WHERE p.role = :role");
                query.setParameter("role", role);
                query.executeUpdate();
                // Clear the role's privileges
                role.setPrivileges(new ArrayList<>());
                roleRepository.saveAndFlush(role);
                entityManager.flush();
            }

            // Assign new privileges
            List<Privilege> newPrivileges = config.privileges;
            if (!newPrivileges.isEmpty()) {
                newPrivileges.forEach(p -> p.setRole(role));
                role.setPrivileges(newPrivileges);
                privilegeRepository.saveAll(newPrivileges);
                roleRepository.saveAndFlush(role);
                logger.info("Assigned {} privileges to role: {}", newPrivileges.size(), config.description);
            } else {
                logger.warn("No privileges assigned to role: {}", config.description);
            }
        }
    }

    public List<Role> findAll() {
        return roleRepository.findAll();
    }

    public Role findById(Long id) {
        return roleRepository.findById(id).orElse(null);
    }

    public void delete(Long id) {
        roleRepository.deleteById(id);
    }

    public Role save(Role role) {
        List<Role> existingRoles = roleRepository.findByDescription(role.getDescription());
        if (!existingRoles.isEmpty()) {
            throw new IllegalArgumentException("Role already exists: " + role.getDescription());
        }
        return roleRepository.save(role);
    }

    public void assignUserRoles(Long userId, List<Long> roleIds) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        List<Role> newRoles = roleIds.stream()
                .map(roleId -> roleRepository.findById(roleId)
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId)))
                .collect(Collectors.toList());
        user.getRoles().clear();
        user.getRoles().addAll(newRoles);
        userRepository.save(user);
    }

    public void unAssignUserRole(Long userId, Long roleId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        user.getRoles().remove(role);
        userRepository.save(user);
    }

    public List<Privilege> getPrivilegesInRole(Long roleId) {
        Role role = findById(roleId);
        return role != null ? role.getPrivileges() : List.of();
    }

    public Role findByDescription(String roleDescription) {
        List<Role> roles = roleRepository.findByDescription(roleDescription);
        if (roles.isEmpty()) {
            return null;
        }
        if (roles.size() > 1) {
            logger.warn("Multiple roles found for description: {}. Returning the first one.", roleDescription);
        }
        return roles.get(0);
    }

    @Transactional
    public void assignPrivilegesToRole(Long roleId, List<Long> privilegeIds) {
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        logger.info("Assigning privileges {} to role {}", privilegeIds, role.getDescription());

        // Clear existing privileges
        List<Privilege> currentPrivileges = role.getPrivileges() != null ? new ArrayList<>(role.getPrivileges()) : new ArrayList<>();
        if (!currentPrivileges.isEmpty()) {
            role.setPrivileges(new ArrayList<>());
            roleRepository.saveAndFlush(role);
            currentPrivileges.forEach(entityManager::detach);
            currentPrivileges.forEach(p -> p.setRole(null));
            privilegeRepository.saveAll(currentPrivileges);
            entityManager.flush();
        }

        // Assign new privileges
        if (privilegeIds != null && !privilegeIds.isEmpty()) {
            List<Privilege> newPrivileges = privilegeIds.stream()
                    .map(privilegeId -> privilegeRepository.findById(privilegeId)
                            .orElseThrow(() -> new IllegalArgumentException("Privilege not found: " + privilegeId)))
                    .collect(Collectors.toList());
            newPrivileges.forEach(p -> p.setRole(role));
            role.setPrivileges(newPrivileges);
            privilegeRepository.saveAll(newPrivileges);
            roleRepository.saveAndFlush(role);
            logger.info("Successfully assigned privileges {} to role {}", privilegeIds, role.getDescription());
        }
    }

    // Helper class for role configuration
    private static class RoleConfig {
        String description;
        String details;
        List<Privilege> privileges;

        RoleConfig(String description, String details, List<Privilege> privileges) {
            this.description = description;
            this.details = details;
            this.privileges = privileges;
        }
    }
}