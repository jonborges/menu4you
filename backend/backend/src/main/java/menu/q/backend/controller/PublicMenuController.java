package menu.q.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityNotFoundException;
import menu.q.backend.model.Employee;
import menu.q.backend.model.Item;
import menu.q.backend.model.Restaurant;
import menu.q.backend.repository.EmployeeRepository;
import menu.q.backend.repository.ItemRepository;
import menu.q.backend.repository.RestaurantRepository;

@RestController
@RequestMapping("/api/public/menu")
public class PublicMenuController {

    private final RestaurantRepository restaurantRepository;
    private final ItemRepository itemRepository;
    private final EmployeeRepository employeeRepository;

    public PublicMenuController(RestaurantRepository restaurantRepository, ItemRepository itemRepository, EmployeeRepository employeeRepository) {
        this.restaurantRepository = restaurantRepository;
        this.itemRepository = itemRepository;
        this.employeeRepository = employeeRepository;
    }

    @GetMapping("/{restaurantId}/table/{tableNumber}")
    public ResponseEntity<Map<String, Object>> getMenuByTable(
            @PathVariable Long restaurantId,
            @PathVariable Integer tableNumber) {
        
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new EntityNotFoundException("Restaurante não encontrado"));

        // Validação: número da mesa deve ser válido
        if (tableNumber < 1 || tableNumber > restaurant.getTableCount()) {
            throw new IllegalArgumentException("Número da mesa inválido. Este restaurante tem " + restaurant.getTableCount() + " mesas.");
        }

        List<Item> items = itemRepository.findByRestaurantId(restaurantId);
        List<Employee> employees = employeeRepository.findByRestaurantId(restaurantId);

        return ResponseEntity.ok(Map.of(
            "restaurant", Map.of(
                "id", restaurant.getId(),
                "name", restaurant.getName(),
                "description", restaurant.getDescription() != null ? restaurant.getDescription() : "",
                "cover", restaurant.getCover() != null ? restaurant.getCover() : ""
            ),
            "tableNumber", tableNumber,
            "items", items,
            "employees", employees
        ));
    }
}
