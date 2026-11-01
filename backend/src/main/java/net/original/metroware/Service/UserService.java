package net.original.metroware.Service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import net.original.metroware.Entity.User;
import net.original.metroware.Repository.UserRepository;
import net.original.metroware.dto.ChangePasswordRequest;
import net.original.metroware.dto.UpdateProfileRequest;
import net.original.metroware.dto.UserDto;
import net.original.metroware.exception.ApiException;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserDto getMe(User principal) {
        return toDto(load(principal));
    }

    public UserDto updateProfile(User principal, UpdateProfileRequest req) {
        User user = load(principal);
        String email = req.getUserEmail().trim().toLowerCase();

        boolean taken = userRepository.findByUserEmail(email)
                .filter(other -> !other.getUserId().equals(user.getUserId()))
                .isPresent();

        if (taken) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        user.setUserName(req.getUserName().trim());
        user.setUserEmail(email);

        return toDto(userRepository.save(user));
    }

    public void changePassword(User principal, ChangePasswordRequest req) {
        User user = load(principal);

        // 400 dete hain (401 nahi), warna frontend galti se logout kar dega
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getUserPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Current password is wrong");
        }

        user.setUserPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    private User load(User principal) {
        return userRepository.findById(principal.getUserId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private UserDto toDto(User u) {
        return new UserDto(u.getUserId(), u.getUserName(), u.getUserRole(), u.getUserEmail());
    }
}