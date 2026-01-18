package menu.q.backend.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import menu.q.backend.data.dto.UserDTO;
import menu.q.backend.model.User;
import menu.q.backend.repository.UserRepository;
import menu.q.backend.util.ImageValidator;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ImageValidator imageValidator;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, ImageValidator imageValidator) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.imageValidator = imageValidator;
    }

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User createUser(UserDTO userDto) {
        // Validação de email duplicado
        if (userDto.getEmail() != null && userRepository.existsByEmail(userDto.getEmail())) {
            throw new IllegalArgumentException("Email já está em uso: " + userDto.getEmail());
        }
        
        // Validação de campos obrigatórios
        if (userDto.getEmail() == null || userDto.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email é obrigatório");
        }
        if (userDto.getUsername() == null || userDto.getUsername().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome de usuário é obrigatório");
        }
        if (userDto.getPassword() == null || userDto.getPassword().length() < 6) {
            throw new IllegalArgumentException("Senha deve ter no mínimo 6 caracteres");
        }
        
        // Validação de formato de email
        if (!userDto.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Formato de email inválido");
        }

        User user = new User();
        user.setUsername(userDto.getUsername());
        user.setEmail(userDto.getEmail());
        
        // Validar avatar se fornecido
        if (userDto.getAvatar() != null && !userDto.getAvatar().trim().isEmpty()) {
            imageValidator.validateImage(userDto.getAvatar());
            user.setAvatar(userDto.getAvatar());
        }
        
        user.setPassword(passwordEncoder.encode(userDto.getPassword()));

        return userRepository.save(user);
    }

    public User getUserById(Long id) {
        try {
            // Garantindo que só 1 usuário seja retornado mesmo se o banco estiver sujo
            List<User> users = userRepository.findAll().stream()
                    .filter(u -> u.getId().equals(id))
                    .toList();

            if (users.size() > 1) {
                // Pega o primeiro e ignora duplicados extras
                return users.get(0);
            }

            return users.isEmpty() ? null : users.get(0);
        } catch (Exception e) {
            return null; // evita crash do endpoint
        }
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }
    
    public User getUserByUsername(String username) {
        // Buscar por username OU email (mesma lógica do CustomUserDetailsService)
        return userRepository.findByUsername(username)
                .or(() -> userRepository.findByEmail(username))
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("User not found: " + username));
    }

    public List<User> getAllUsers(String username) {
        List<User> users = userRepository.findAll();

        if (username != null && !username.isEmpty()) {
            return users.stream()
                    .filter(user -> user.getUsername().toLowerCase().contains(username.toLowerCase()))
                    .collect(Collectors.toList());
        }

        return users;
    }

    public User updateUser(Long id, UserDTO userDto) {
        Optional<User> optUser = userRepository.findById(id);

        if (optUser.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = optUser.get();

        if (userDto.getAvatar() != null && !userDto.getAvatar().trim().isEmpty()) {
            imageValidator.validateImage(userDto.getAvatar()); // Valida ID de imagem padrão
            user.setAvatar(userDto.getAvatar());
        }

        if (userDto.getUsername() != null) user.setUsername(userDto.getUsername());
        if (userDto.getEmail() != null) user.setEmail(userDto.getEmail());
        if (userDto.getAvatar() != null) user.setAvatar(userDto.getAvatar());

        return userRepository.save(user);
    }
}
