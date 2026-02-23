package com.budgetflow.budgetflow.controller;

import com.budgetflow.budgetflow.model.User;
import com.budgetflow.budgetflow.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthController(UserRepository userRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // REGISTER
    @PostMapping("/register")
    public String register(@RequestBody User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            return "Email already exists!";
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        return "User registered successfully!";
    }

    // LOGIN
    @PostMapping("/login")
    public String login(@RequestBody User loginRequest) {

        Optional<User> userOptional =
                userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isEmpty()) {
            return "User not found!";
        }

        User user = userOptional.get();

        if (passwordEncoder.matches(
                loginRequest.getPassword(),
                user.getPassword())) {

            return "Login successful!";
        } else {
            return "Invalid password!";
        }
    }
}