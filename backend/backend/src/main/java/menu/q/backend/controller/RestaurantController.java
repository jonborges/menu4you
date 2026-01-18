package menu.q.backend.controller;

import jakarta.persistence.EntityNotFoundException;
import menu.q.backend.data.dto.RestaurantDto;
import menu.q.backend.model.Employee;
import menu.q.backend.model.Restaurant;
import menu.q.backend.service.RestaurantService;
import menu.q.backend.util.ImageValidator;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
public class RestaurantController {

    private final RestaurantService restaurantService;
    private final ImageValidator imageValidator;

    public RestaurantController(RestaurantService restaurantService, ImageValidator imageValidator) {
        this.restaurantService = restaurantService;
        this.imageValidator = imageValidator;
    }

    @GetMapping
    public List<Restaurant> getAll() {
        return restaurantService.getAllRestaurants();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Restaurant> getById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(restaurantService.getRestaurantById(id));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/owner/{ownerId}")
    public ResponseEntity<Restaurant> getByOwnerId(@PathVariable Long ownerId) {
        try {
            return ResponseEntity.ok(restaurantService.getRestaurantByOwner(ownerId));
        } catch (EntityNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PostMapping
    public ResponseEntity<Restaurant> create(@RequestBody RestaurantDto dto) {
        imageValidator.validateImage(dto.getCover());
        return ResponseEntity.status(HttpStatus.CREATED).body(restaurantService.createRestaurantWithOwner(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Restaurant> update(@PathVariable Long id, @RequestBody RestaurantDto dto) {
        imageValidator.validateImage(dto.getCover());
        return ResponseEntity.ok(restaurantService.updateRestaurant(id, dto));
    }

    @GetMapping("/{id}/employees")
    public ResponseEntity<List<Employee>> getEmployees(@PathVariable Long id) {
        return ResponseEntity.ok(restaurantService.getEmployeesByRestaurant(id));
    }
}