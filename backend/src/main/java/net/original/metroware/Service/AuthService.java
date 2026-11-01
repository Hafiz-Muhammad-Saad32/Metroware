package net.original.metroware.Service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import net.original.metroware.Entity.User;
import net.original.metroware.Repository.UserRepository;
import net.original.metroware.dto.LoginRequest;
import net.original.metroware.dto.LoginResponse;
import net.original.metroware.dto.SignupRequest;
import net.original.metroware.dto.UserDto;
import net.original.metroware.exception.ApiException;
import net.original.metroware.security.JwtService;
import net.original.metroware.security.RateLimiter;

@Service
public class AuthService {

    // ek email par 5 galat password ke baad 15 minute ke liye login band
    private static final int MAX_FAILED_LOGINS = 5;
    private static final long LOCK_MS = 15 * 60 * 1000L;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RateLimiter rateLimiter;

    // email na milne par bhi itna hi waqt lagane ke liye (timing se email ka pata na chale)
    private final String dummyHash;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       RateLimiter rateLimiter) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.rateLimiter = rateLimiter;
        this.dummyHash = passwordEncoder.encode("not-a-real-password");
    }

    public LoginResponse signup(SignupRequest request) {

        String email = request.getUserEmail().trim().toLowerCase();

        if (userRepository.findByUserEmail(email).isPresent()) {
            throw new ApiException(HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User();
        user.setUserName(request.getUserName().trim());
        user.setUserEmail(email);
        user.setUserPassword(passwordEncoder.encode(request.getUserPassword()));
        user.setUserRole("user"); // role kabhi client se nahi aayega

        user = userRepository.save(user);

        return buildResponse(user);
    }

    public LoginResponse login(LoginRequest request) {

        String email = request.getUserEmail().trim().toLowerCase();
        String failKey = "login-fail:" + email;

        if (rateLimiter.isLimited(failKey, MAX_FAILED_LOGINS, LOCK_MS)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many failed attempts. Try again in 15 minutes.");
        }

        User user = userRepository.findByUserEmail(email).orElse(null);

        // user na ho tab bhi password check chalta hai (same waqt)
        String hash = user != null ? user.getUserPassword() : dummyHash;
        boolean passwordOk = passwordEncoder.matches(request.getUserPassword(), hash);

        if (user == null || !passwordOk) {
            rateLimiter.record(failKey, LOCK_MS);
            // email ya password dono galat hone par same message (security)
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        rateLimiter.reset(failKey);
        return buildResponse(user);
    }

    private LoginResponse buildResponse(User user) {
        UserDto dto = new UserDto(
                user.getUserId(),
                user.getUserName(),
                user.getUserRole(),
                user.getUserEmail());

        return new LoginResponse(jwtService.generateToken(user), dto);
    }
}