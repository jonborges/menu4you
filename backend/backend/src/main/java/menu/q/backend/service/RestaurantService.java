package menu.q.backend.service;

import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import menu.q.backend.data.dto.RestaurantDto;
import menu.q.backend.model.Employee;
import menu.q.backend.model.Restaurant;
import menu.q.backend.model.User;
import menu.q.backend.repository.EmployeeRepository;
import menu.q.backend.repository.RestaurantRepository;
import menu.q.backend.repository.UserRepository;
import menu.q.backend.util.ImageValidator;

@Service
public class RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final ImageValidator imageValidator;
    // simple in-memory caches to reduce DB hits for common read paths
    private volatile List<Restaurant> cachedList = null;
    private volatile long cachedListAt = 0L;
    private final ConcurrentHashMap<Long, Restaurant> ownerCache = new ConcurrentHashMap<>();
    private final ConcurrentHashMap<Long, Long> ownerCacheAt = new ConcurrentHashMap<>();
    private static final long CACHE_TTL_MS = 5000L; // 5 seconds

    public RestaurantService(RestaurantRepository restaurantRepository, UserRepository userRepository, EmployeeRepository employeeRepository, ImageValidator imageValidator) {
        this.restaurantRepository = restaurantRepository;
        this.userRepository = userRepository;
        this.employeeRepository = employeeRepository;
        this.imageValidator = imageValidator;
    }

    public Restaurant createRestaurant(Restaurant restaurant) {
        Restaurant saved = restaurantRepository.save(restaurant);
        invalidateCaches(saved);
        return saved;
    }

    public Restaurant createRestaurantWithOwner(RestaurantDto dto) {
        User owner = userRepository.findById(dto.getOwnerId())
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
        
        // Validação: usuário só pode ter 1 restaurante
        List<Restaurant> existingRestaurants = restaurantRepository.findByOwnerId(dto.getOwnerId());
        if (!existingRestaurants.isEmpty()) {
            throw new IllegalStateException("Usuário já possui um restaurante cadastrado");
        }
        
        // Validação de campos obrigatórios
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do restaurante é obrigatório");
        }
        
        Restaurant restaurant = new Restaurant();
        restaurant.setName(dto.getName());
        // Resolver imagem: se for ID padrão, converte para URL
        restaurant.setCover(imageValidator.resolveImageUrl(dto.getCover()));
        restaurant.setVisibleCategories(dto.getVisibleCategories());
        restaurant.setOwner(owner);
        
        Restaurant saved = restaurantRepository.save(restaurant);
        invalidateCaches(saved);
        return saved;
    }

    public Restaurant getRestaurantById(Long id) {
        return restaurantRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
    }

    public List<Restaurant> getAllRestaurants() {
        long now = System.currentTimeMillis();
        if (cachedList != null && (now - cachedListAt) < CACHE_TTL_MS) {
            return cachedList;
        }
        List<Restaurant> fresh = restaurantRepository.findAll();
        cachedList = fresh;
        cachedListAt = now;
        return fresh;
    }

    public Restaurant getRestaurantByOwner(Long ownerId) {
        long now = System.currentTimeMillis();
        Long at = ownerCacheAt.get(ownerId);
        Restaurant cached = ownerCache.get(ownerId);
        if (cached != null && at != null && (now - at) < CACHE_TTL_MS) {
            return cached;
        }
        Restaurant fresh = restaurantRepository.findFirstByOwnerId(ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found for owner: " + ownerId));
        ownerCache.put(ownerId, fresh);
        ownerCacheAt.put(ownerId, now);
        return fresh;
    }

    public Restaurant updateRestaurant(Long id, RestaurantDto dto) {
        Restaurant existing = restaurantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
        
        if (dto.getName() != null) existing.setName(dto.getName());
        if (dto.getDescription() != null) existing.setDescription(dto.getDescription());
        if (dto.getCover() != null) {
            // Resolver imagem: se for ID padrão, converte para URL
            existing.setCover(imageValidator.resolveImageUrl(dto.getCover()));
        }
        if (dto.getVisibleCategories() != null) existing.setVisibleCategories(dto.getVisibleCategories());
        if (dto.getTableCount() != null) {
            // Validar limite de mesas
            if (dto.getTableCount() < 1) {
                throw new IllegalArgumentException("Número de mesas deve ser no mínimo 1");
            }
            if (dto.getTableCount() > 50) {
                throw new IllegalArgumentException("Número de mesas não pode exceder 50");
            }
            existing.setTableCount(dto.getTableCount());
        }
        
        Restaurant saved = restaurantRepository.save(existing);
        invalidateCaches(saved);
        return saved;
    }

    public List<Employee> getEmployeesByRestaurant(Long restaurantId) {
        return employeeRepository.findByRestaurantId(restaurantId);
    }

    private void invalidateCaches(Restaurant saved) {
        cachedListAt = 0L;
        if (saved.getOwner() != null && saved.getOwner().getId() != null) {
            ownerCache.put(saved.getOwner().getId(), saved);
            ownerCacheAt.put(saved.getOwner().getId(), System.currentTimeMillis());
        }
    }
}
