package com.simon.armas_springboot_api.config;

import com.simon.armas_springboot_api.models.Directorate;
import com.simon.armas_springboot_api.models.Organization;
import com.simon.armas_springboot_api.models.User;
import com.simon.armas_springboot_api.repositories.DirectorateRepository;
import com.simon.armas_springboot_api.repositories.OrganizationRepository;
import com.simon.armas_springboot_api.repositories.UserRepository;
import com.simon.armas_springboot_api.security.models.Role;
import com.simon.armas_springboot_api.security.repositories.RoleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Configuration
public class AdminUserInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(AdminUserInitializer.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final OrganizationRepository organizationRepository;
    private final DirectorateRepository directorateRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminUserInitializer(UserRepository userRepository,
            RoleRepository roleRepository,
            OrganizationRepository organizationRepository,
            DirectorateRepository directorateRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.organizationRepository = organizationRepository;
        this.directorateRepository = directorateRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        logger.info("Checking for admin user initialization...");

        // Check if admin user exists
        User adminUser = userRepository.findByUsername("admin");
        if (adminUser == null) {
            logger.info("Admin user not found. Creating default admin user.");

            // 1. Setup Role (ADMIN)
            Role adminRole;
            List<Role> roles = roleRepository.findByDescription("ADMIN");
            if (roles.isEmpty()) {
                adminRole = new Role();
                adminRole.setDescription("ADMIN");
                adminRole.setDetails("System Administrator");
                adminRole = roleRepository.save(adminRole);
            } else {
                adminRole = roles.get(0);
            }

            // 2. Setup Organization (Default Org)
            Organization defaultOrg;
            List<Organization> orgs = organizationRepository.findAll();
            if (orgs.isEmpty()) {
                defaultOrg = new Organization();
                defaultOrg.setId(UUID.randomUUID().toString());
                defaultOrg.setOrgname("Oromia Finance Bureau");
                defaultOrg.setEmail("ofb@gmail.com");
                defaultOrg.setTelephone("000000000");
                defaultOrg.setOrgtype("Main");
                defaultOrg = organizationRepository.save(defaultOrg);
            } else {
                defaultOrg = orgs.get(0);
            }

            // 3. Setup Directorate (Default Directorate)
            Directorate defaultDirectorate;
            Optional<Directorate> dirOpt = directorateRepository.findByDirectoratenameIgnoreCase("Default Directorate");
            if (dirOpt.isEmpty()) {
                defaultDirectorate = new Directorate();
                defaultDirectorate.setId(UUID.randomUUID().toString());
                defaultDirectorate.setDirectoratename("Audit Directorate");
                defaultDirectorate.setEmail("auditdirector@gmail.com");
                defaultDirectorate.setTelephone("000000000");
                defaultDirectorate = directorateRepository.save(defaultDirectorate);
            } else {
                defaultDirectorate = dirOpt.get();
            }

            // 4. Create User
            User user = new User();
            user.setUsername("admin");
            user.setPassword(passwordEncoder.encode("Simon@1234")); // Default password
            user.setFirstName("System");
            user.setLastName("Admin");
            user.setEnabled(true);

            // Set Role
            HashSet<Role> userRoles = new HashSet<>();
            userRoles.add(adminRole);
            user.setRoles(userRoles);

            // Set Org & Directorate
            user.setOrganization(defaultOrg);
            user.setDirectorate(defaultDirectorate);

            userRepository.save(user);

            logger.info("Default admin user created successfully! Username: admin, Password: admin123");
        } else {
            logger.info("Admin user already exists.");
        }
    }
}
