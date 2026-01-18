package menu.q.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import menu.q.backend.model.User;
import menu.q.backend.repository.UserRepository;

/**
 * ⚠️ CONTROLLER TEMPORÁRIO PARA DESENVOLVIMENTO ⚠️
 * Permite resetar senhas durante migração para BCrypt
 * REMOVER EM PRODUÇÃO!
 */
@RestController
@RequestMapping("/api/dev")
public class DevController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DevController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    record ResetPasswordRequest(String email, String newPassword) {}

    /**
     * POST /api/dev/reset-password
     * Body: { "email": "seu@email.com", "newPassword": "novaSenha123" }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest req) {
        User user = userRepository.findByEmail(req.email())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
        
        user.setPassword(passwordEncoder.encode(req.newPassword()));
        userRepository.save(user);
        
        return ResponseEntity.ok("Senha atualizada para: " + req.email());
    }

    /**
     * GET /api/dev/list-users
     * Lista todos os usuários e mostra se a senha está em BCrypt
     */
    @GetMapping("/list-users")
    public ResponseEntity<?> listUsers() {
        var users = userRepository.findAll().stream()
                .map(u -> {
                    String status = u.getPassword() == null ? "NULL" :
                                  u.getPassword().startsWith("$2a$") || u.getPassword().startsWith("$2b$") ? 
                                  "BCrypt ✅" : "Texto Puro ❌";
                    return new UserInfo(u.getId(), u.getUsername(), u.getEmail(), status);
                })
                .toList();
        return ResponseEntity.ok(users);
    }

    record UserInfo(Long id, String username, String email, String passwordStatus) {}
}
