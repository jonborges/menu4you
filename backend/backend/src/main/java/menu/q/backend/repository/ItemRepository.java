package menu.q.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import menu.q.backend.model.Item;

public interface ItemRepository extends JpaRepository<Item, Long> {
    List<Item> findByUserId(Long userId);
    List<Item> findByNameContainingIgnoreCase(String name);
    List<Item> findByRestaurantId(Long restaurantId);
    
    @Query("SELECT i FROM Item i WHERE i.restaurant.id = :restaurantId AND i.featured = true")
    List<Item> findFeaturedByRestaurantId(@Param("restaurantId") Long restaurantId);
}
