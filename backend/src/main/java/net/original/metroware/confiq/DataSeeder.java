package net.original.metroware.confiq;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import net.original.metroware.Entity.User;
import net.original.metroware.Repository.UserRepository;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.admin-name}")
    private String adminName;

    @Value("${app.seed.admin-email}")
    private String adminEmail;

    @Value("${app.seed.admin-password}")
    private String adminPassword;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        String email = adminEmail.trim().toLowerCase();

        if (userRepository.findByUserEmail(email).isEmpty()) {
            User admin = new User();
            admin.setUserName(adminName);
            admin.setUserEmail(email);
            admin.setUserPassword(passwordEncoder.encode(adminPassword));
            admin.setUserRole("admin");
            userRepository.save(admin);
            System.out.println("Default admin created: " + email);
        }
    }
}