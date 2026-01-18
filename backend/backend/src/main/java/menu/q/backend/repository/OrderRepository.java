package menu.q.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import menu.q.backend.model.Order;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByBuyerId(Long buyerId);
    List<Order> findByRestaurantId(Long restaurantId);
}
