package menu.q.backend.repository;

import java.util.List;
import menu.q.backend.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findByRestaurantId(Long restaurantId);
}