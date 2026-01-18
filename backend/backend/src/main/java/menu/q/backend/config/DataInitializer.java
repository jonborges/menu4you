package menu.q.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.transaction.annotation.Transactional;

import menu.q.backend.model.User;
import menu.q.backend.model.Restaurant;
import menu.q.backend.repository.UserRepository;
import menu.q.backend.repository.RestaurantRepository;

import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;

    public DataInitializer(UserRepository userRepository, RestaurantRepository restaurantRepository) {
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Garante que o usuário existe
        User u = userRepository.findByUsername("Jonathan Doe").orElse(null);
        if (u == null) {
            u = new User();
            u.setUsername("Jonathan Doe");
            u.setEmail("jonathan@menuq.com");
            u = userRepository.save(u);
        }

        // Garante que o restaurante existe para esse usuário
        if (restaurantRepository.findByOwnerId(u.getId()).isEmpty()) {
            Restaurant r = new Restaurant();
            r.setName("Meu Restaurante");
            r.setDescription("Restaurante inicial para desenvolvimento");
            r.setOwner(u);
            restaurantRepository.save(r);
        }

        // Garantir restaurante para user id 5
        User user5 = userRepository.findById(5L).orElse(null);
        if (user5 != null && restaurantRepository.findByOwnerId(5L).isEmpty()) {
            Restaurant r = new Restaurant();
            r.setName("Restaurante User 5");
            r.setDescription("Restaurante para testes");
            r.setOwner(user5);
            restaurantRepository.save(r);
        }
    }
}
