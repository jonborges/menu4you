package menu.q.backend.controller;

import jakarta.persistence.EntityNotFoundException;
import menu.q.backend.data.dto.EmployeeDto;
import menu.q.backend.model.Employee;
import menu.q.backend.model.Restaurant;
import menu.q.backend.repository.EmployeeRepository;
import menu.q.backend.repository.RestaurantRepository;
import menu.q.backend.util.ImageValidator;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/employees")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final RestaurantRepository restaurantRepository;
    private final ImageValidator imageValidator;

    public EmployeeController(EmployeeRepository employeeRepository, 
                            RestaurantRepository restaurantRepository,
                            ImageValidator imageValidator) {
        this.employeeRepository = employeeRepository;
        this.restaurantRepository = restaurantRepository;
        this.imageValidator = imageValidator;
    }

    @PostMapping
    public ResponseEntity<Employee> create(@RequestBody EmployeeDto dto) {
        imageValidator.validateImage(dto.getImage()); // Valida ID de imagem padrão
        @SuppressWarnings("null")
        Restaurant restaurant = restaurantRepository.findById(dto.getRestaurantId())
                .orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));
        
        Employee employee = new Employee(dto.getName(), dto.getRole(), dto.getImage(), restaurant);
        return ResponseEntity.status(HttpStatus.CREATED).body(employeeRepository.save(employee));
    }

    @SuppressWarnings("null")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (employeeRepository.existsById(id)) {
            employeeRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Employee> update(@PathVariable Long id, @RequestBody EmployeeDto dto) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
        
        if (dto.getName() != null) employee.setName(dto.getName());
        if (dto.getRole() != null) employee.setRole(dto.getRole());
        if (dto.getImage() != null) {
            imageValidator.validateImage(dto.getImage()); // Valida ID de imagem padrão
            employee.setImage(dto.getImage());
        }
        
        return ResponseEntity.ok(employeeRepository.save(employee));
    }
}