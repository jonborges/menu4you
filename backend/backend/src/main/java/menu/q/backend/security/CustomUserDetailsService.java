package menu.q.backend.security;

import java.util.Collections;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import menu.q.backend.model.User;
import menu.q.backend.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // Tentar buscar por username primeiro, depois por email
        User user = userRepository.findByUsername(username)
            .or(() -> userRepository.findByEmail(username))
            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
        
        System.out.println("=== CustomUserDetailsService ===");
        System.out.println("Input: " + username);
        System.out.println("Found user: " + user.getUsername() + " / " + user.getEmail());
        System.out.println("Password hash: " + (user.getPassword() != null ? user.getPassword().substring(0, 20) + "..." : "null"));
        System.out.println("===============================");
            
        // IMPORTANTE: Retornar o username/email que foi usado para buscar, não o username do banco
        // Isso garante que o AuthenticationManager compare corretamente
        return new org.springframework.security.core.userdetails.User(
            username, // Usar o que foi enviado (pode ser username ou email)
            user.getPassword() == null ? "" : user.getPassword(),
            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
        );
    }
}
