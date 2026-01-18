package menu.q.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import menu.q.backend.model.Restaurant;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
	List<Restaurant> findByOwnerId(Long ownerId);
	
	@Query("SELECT r FROM Restaurant r WHERE r.owner.id = :ownerId ORDER BY r.id ASC LIMIT 1")
	Optional<Restaurant> findFirstByOwnerId(Long ownerId);
}
