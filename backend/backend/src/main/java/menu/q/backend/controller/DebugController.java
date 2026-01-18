package menu.q.backend.controller;

import menu.q.backend.model.User;
import menu.q.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/debug")
@CrossOrigin(origins = "*")
public class DebugController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostMapping("/fix-fk-final")
    public ResponseEntity<?> fixFkFinal() {
        try {
            System.out.println("=== FIXING FK TO POINT TO restaurants (PLURAL) ===");
            
            // Disable FK checks temporarily
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            System.out.println("✓ FK checks disabled");
            
            // DROP the broken FK from items
            try {
                jdbcTemplate.execute("ALTER TABLE items DROP FOREIGN KEY FKkni9axj2288cnkoxbe0c1qt2i");
                System.out.println("✓ Dropped broken FK from items");
            } catch (Exception e) {
                System.out.println("- FK already dropped or doesn't exist");
            }
            
            // DROP any other FKs that might exist
            String[] otherFKs = {
                "ALTER TABLE items DROP FOREIGN KEY IF EXISTS FK8a8t8b4mnfx3lpdc3gf5e2bnb",
                "ALTER TABLE items DROP FOREIGN KEY IF EXISTS FK_items_restaurant",
                "ALTER TABLE items DROP FOREIGN KEY IF EXISTS FK_item_restaurant"
            };
            for (String stmt : otherFKs) {
                try { jdbcTemplate.execute(stmt); System.out.println("✓ " + stmt); } catch (Exception e) { }
            }
            
            // CREATE the correct FK pointing to restaurants (PLURAL)
            jdbcTemplate.execute("ALTER TABLE items ADD CONSTRAINT FK_items_restaurants FOREIGN KEY (restaurant_id) REFERENCES restaurants(id) ON DELETE CASCADE ON UPDATE CASCADE");
            System.out.println("✓ Created FK: items.restaurant_id → restaurants.id");
            
            // Re-enable FK checks
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            System.out.println("✓ FK checks re-enabled");
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "✅ FK FIXED!\nFK agora aponta para: restaurants (PLURAL)\nTente criar item agora!"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("error", e.getMessage(), "success", false));
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");

        if (email == null || newPassword == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email e newPassword são obrigatórios"));
        }

        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Usuário não encontrado"));
        }

        String encodedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encodedPassword);
        userRepository.save(user);

        System.out.println("=== DEBUG RESET PASSWORD ===");
        System.out.println("Email: " + email);
        System.out.println("New Password (plain): " + newPassword);
        System.out.println("Encoded Password: " + encodedPassword);
        System.out.println("===========================");

        return ResponseEntity.ok(Map.of("message", "Senha resetada com sucesso", "email", email, "encodedPassword", encodedPassword));
    }

    @PostMapping("/create-test-user")
    public ResponseEntity<?> createTestUser() {
        String email = "teste@teste.com";
        String password = "123456";
        String username = "teste";

        User existing = userRepository.findByEmail(email).orElse(null);
        if (existing != null) {
            userRepository.delete(existing);
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of(
            "message", "Usuário de teste criado",
            "email", email,
            "password", password,
            "username", username
        ));
    }

    @GetMapping("/check-user")
    public ResponseEntity<?> checkUser(@RequestParam String email) {
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            return ResponseEntity.ok(Map.of("found", false, "message", "Usuário não encontrado"));
        }

        String storedPassword = user.getPassword();
        boolean matches = passwordEncoder.matches("123456", storedPassword);

        return ResponseEntity.ok(Map.of(
            "found", true,
            "id", user.getId(),
            "email", user.getEmail(),
            "username", user.getUsername(),
            "passwordHash", storedPassword.substring(0, 20) + "...",
            "passwordMatches123456", matches
        ));
    }

    @PostMapping("/force-create-item")
    public ResponseEntity<?> forceCreateItem(@RequestParam Long restaurantId, @RequestParam Long userId) {
        try {
            // Tentar criar via JDBC nativo para bypassar o Hibernate
            return ResponseEntity.ok(Map.of("message", "Use o endpoint normal de criação"));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/setup-complete-test")
    public ResponseEntity<?> setupCompleteTest() {
        try {
            System.out.println("=== FIXING DATABASE ===");
            
            // Limpa tudo e recria
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 0");
            jdbcTemplate.execute("TRUNCATE TABLE order_item");
            jdbcTemplate.execute("TRUNCATE TABLE `order`");
            jdbcTemplate.execute("TRUNCATE TABLE item");
            jdbcTemplate.execute("TRUNCATE TABLE employee");
            jdbcTemplate.execute("TRUNCATE TABLE restaurants");
            jdbcTemplate.execute("TRUNCATE TABLE users");
            jdbcTemplate.execute("SET FOREIGN_KEY_CHECKS = 1");
            
            System.out.println("Database cleaned");
            
            // Cria usuário
            String email = "teste@teste.com";
            String encodedPassword = passwordEncoder.encode("123456");
            jdbcTemplate.update(
                "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
                "teste", email, encodedPassword
            );
            
            Long userId = jdbcTemplate.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
            System.out.println("User created with ID: " + userId);
            
            return ResponseEntity.ok(Map.of(
                "message", "Database limpo! Faça login com teste@teste.com / 123456 e crie um restaurante",
                "userId", userId,
                "email", email,
                "password", "123456"
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.ok(Map.of("error", e.getMessage()));
        }
    }
}
