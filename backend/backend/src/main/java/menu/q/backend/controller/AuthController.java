package menu.q.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import menu.q.backend.data.dto.UserDTO;
import menu.q.backend.model.User;
import menu.q.backend.security.JwtUtil;
import menu.q.backend.service.UserService;

@RestController
@RequestMapping("/api/auth")
@SuppressWarnings("unused")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(AuthenticationManager authenticationManager, UserService userService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    record AuthRequest(String username, String password) {}
    record AuthResponse(String token, Long userId, String username, String email) {}

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody UserDTO dto) {
        try {
            User created = userService.createUser(dto);
            String token = jwtUtil.generateToken(created.getUsername());
            return ResponseEntity.ok(new AuthResponse(token, created.getId(), created.getUsername(), created.getEmail()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest req) {
        try {
            System.out.println("=== LOGIN ATTEMPT ===");
            System.out.println("Username/Email: " + req.username());
            System.out.println("Password: " + req.password());
            
            Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.username(), req.password())
            );
            
            System.out.println("Authentication successful!");
            
            User user = userService.getUserByUsername(req.username());
            String token = jwtUtil.generateToken(req.username());
            
            return ResponseEntity.ok(new AuthResponse(token, user.getId(), user.getUsername(), user.getEmail()));
        } catch (Exception e) {
            System.out.println("Login failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(401).body("Credenciais inválidas");
        }
    }
}
