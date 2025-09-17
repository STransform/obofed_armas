package com.simon.armas_springboot_api.repositories;

import com.simon.armas_springboot_api.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    // Updated query to fetch roles, organization, and directorate
    @Query("SELECT u FROM User u JOIN FETCH u.organization o LEFT JOIN FETCH u.directorate d JOIN FETCH u.roles r WHERE u.username = :username")
    User findByUsername(@Param("username") String username);

    @Query("SELECT u FROM User u JOIN FETCH u.organization JOIN FETCH u.directorate")
    List<User> findAllWithOrganizationsAndDirectorates();

    @Query("SELECT u FROM User u JOIN FETCH u.roles")
    List<User> findAll();

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.description = :roleName")
    List<User> findByRoleName(@Param("roleName") String roleName);

    @Query("SELECT u FROM User u JOIN u.roles r WHERE r.description = :roleName AND u.organization.id = :organizationId")
    List<User> findByRoleNameAndOrganizationId(@Param("roleName") String roleName, @Param("organizationId") String organizationId);

    @Query("SELECT u FROM User u JOIN FETCH u.organization JOIN FETCH u.directorate WHERE u.id = :id")
    Optional<User> findByIdWithRelations(@Param("id") Long id);

    @Query("SELECT u FROM User u WHERE u.organization.id = :organizationId")
    List<User> findByOrganizationId(@Param("organizationId") String organizationId);
}