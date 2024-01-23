package com.example.noteapp.auth;

import com.example.noteapp.config.JwtService;
import com.example.noteapp.tfa.TwoFactorAuthenticationService;
import com.example.noteapp.user.Role;
import com.example.noteapp.user.User;
import com.example.noteapp.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.val;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final UserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final TwoFactorAuthenticationService tfaService;

    private static final int MAX_ATTEMPTS = 5;
    private static final long LOCK_TIME_DURATION = 30 * 60 * 1000;

    private final Map<String, Integer> loginAttemptsCache = new ConcurrentHashMap<>();
    private final Map<String, Long> lockTimeCache = new ConcurrentHashMap<>();

    public AuthenticationResponse register(RegisterRequest request) {
        if (repository.findByEmail(request.getEmail()).isPresent()) {
            throw new DataIntegrityViolationException("User with this email already exists");
        }
        validateRegistrationRequest(request);


        var user = User.builder()
                .firstname(request.getFirstname())
                .lastname(request.getLastname())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.ADMIN)
                .mfaEnabled(request.isMfaEnabled())
                .build();

        // if MFA enabled --> Generate Secret
        if (request.isMfaEnabled()) {
            user.setSecret(tfaService.generateNewSecret());
        }
        repository.save(user);
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        return AuthenticationResponse.builder()
                .secretImageUri(tfaService.generateQrCodeImageUri(user.getSecret()))
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .mfaEnabled(user.isMfaEnabled())
                .build();
    }

    private void validateRegistrationRequest(RegisterRequest request) {
        validateEmail(request.getEmail());
        validatePassword(request.getPassword());
    }

    private void validateEmail(String email) {
        if (email == null || !email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
    }


    private void validatePassword(String password) {
        if (password == null || password.length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters long");
        }
        if (!password.matches(".*[A-Z].*")) {
            throw new IllegalArgumentException("Password must contain at least one uppercase letter");
        }
        if (!password.matches(".*[a-z].*")) {
            throw new IllegalArgumentException("Password must contain at least one lowercase letter");
        }
        if (!password.matches(".*[0-9].*")) {
            throw new IllegalArgumentException("Password must contain at least one digit");
        }
        if (!password.matches(".*[!@#$%^&*()].*")) {
            throw new IllegalArgumentException("Password must contain at least one special character (!@#$%^&*())");
        }
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        checkUserLock(request.getEmail());

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
            var user = repository.findByEmail(request.getEmail())
                    .orElseThrow();

            resetLoginAttemptsCache(request.getEmail());

            if (user.isMfaEnabled()) {
                return AuthenticationResponse.builder()
                        .accessToken("")
                        .refreshToken("")
                        .secretImageUri(tfaService.generateQrCodeImageUri(user.getSecret()))
                        .mfaEnabled(true)
                        .build();
            }
            var jwtToken = jwtService.generateToken(user);
            var refreshToken = jwtService.generateRefreshToken(user);
            return AuthenticationResponse.builder()
                    .accessToken(jwtToken)
                    .refreshToken(refreshToken)
                    .mfaEnabled(false)
                    .build();
        } catch (AuthenticationException e) {
            val attemptsLeft = incrementLoginAttemptsCache(request.getEmail());
            throw new BadCredentialsException("Invalid email/password supplied. Attempts left: " + attemptsLeft + "/" + MAX_ATTEMPTS);
        }
    }

    private void checkUserLock(String email) {
        if (loginAttemptsCache.containsKey(email) && loginAttemptsCache.get(email) >= MAX_ATTEMPTS) {
            Long lockTime = lockTimeCache.getOrDefault(email, 0L);
            if (System.currentTimeMillis() - lockTime < LOCK_TIME_DURATION) {
                val timeLeft = (LOCK_TIME_DURATION - (System.currentTimeMillis() - lockTime)) / 1000 / 60;
                throw new LockedException("Account is temporarily locked due to multiple failed attempts: Try again in " + timeLeft + " minutes");
            } else {
                // Reset after lock duration is over
                resetLoginAttemptsCache(email);
            }
        }
    }

    private int incrementLoginAttemptsCache(String email) {
        int attempts = loginAttemptsCache.getOrDefault(email, 0);
        attempts++;
        loginAttemptsCache.put(email, attempts);
        if (attempts >= MAX_ATTEMPTS) {
            lockTimeCache.put(email, System.currentTimeMillis());
        }
        return MAX_ATTEMPTS - attempts;

    }

    private void resetLoginAttemptsCache(String email) {
        loginAttemptsCache.remove(email);
        lockTimeCache.remove(email);
    }

    public void refreshToken(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws IOException {
        final String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);
        final String refreshToken;
        final String userEmail;
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return;
        }
        refreshToken = authHeader.substring(7);
        userEmail = jwtService.extractUsername(refreshToken);
        if (userEmail != null) {
            var user = this.repository.findByEmail(userEmail)
                    .orElseThrow();
            if (jwtService.isTokenValid(refreshToken, user)) {
                var accessToken = jwtService.generateToken(user);
                var authResponse = AuthenticationResponse.builder()
                        .accessToken(accessToken)
                        .refreshToken(refreshToken)
                        .mfaEnabled(false)
                        .build();
                new ObjectMapper().writeValue(response.getOutputStream(), authResponse);
            }
        }
    }

    public AuthenticationResponse verifyCode(
            VerificationRequest verificationRequest
    ) {
        User user = repository
                .findByEmail(verificationRequest.getEmail())
                .orElseThrow(() -> new EntityNotFoundException(
                        String.format("No user found with %S", verificationRequest.getEmail()))
                );
        if (tfaService.isOtpNotValid(user.getSecret(), verificationRequest.getCode())) {

            throw new BadCredentialsException("Code is not correct");
        }
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .mfaEnabled(user.isMfaEnabled())
                .build();
    }
}
