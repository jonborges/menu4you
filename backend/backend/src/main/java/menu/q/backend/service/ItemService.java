package menu.q.backend.service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import menu.q.backend.data.dto.ItemDto;
import menu.q.backend.model.Item;
import menu.q.backend.model.User;
import menu.q.backend.model.Restaurant;
import menu.q.backend.repository.ItemRepository;
import menu.q.backend.repository.UserRepository;
import menu.q.backend.repository.RestaurantRepository;
import menu.q.backend.repository.OrderItemRepository;
import menu.q.backend.util.ImageValidator;
import menu.q.backend.util.CategoryImageMapper;

@Service
public class ItemService {
    
    private final ItemRepository itemRepository;
    
    public List<Item> searchByName(String name) {
        return itemRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Item> getByRestaurantId(Long restaurantId) {
        return itemRepository.findByRestaurantId(restaurantId);
    }

    public List<Item> getFeaturedByRestaurantId(Long restaurantId) {
        return itemRepository.findFeaturedByRestaurantId(restaurantId);
    }

    private final UserRepository userRepository;
    private final RestaurantRepository restaurantRepository;
    private final OrderItemRepository orderItemRepository;
    private final ImageValidator imageValidator;

    public ItemService(ItemRepository itemRepository, UserRepository userRepository, RestaurantRepository restaurantRepository, OrderItemRepository orderItemRepository, ImageValidator imageValidator) {
        this.itemRepository = itemRepository;
        this.userRepository = userRepository;
        this.restaurantRepository = restaurantRepository;
        this.orderItemRepository = orderItemRepository;
        this.imageValidator = imageValidator;
    }

    public Item createItem(ItemDto itemDto) {
        if (itemDto.getName() == null || itemDto.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Nome do item é obrigatório");
        }
        if (itemDto.getPrice() == null || itemDto.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Preço deve ser maior que zero");
        }
        if (itemDto.getUserId() == null) {
            throw new IllegalArgumentException("ID do usuário é obrigatório");
        }
        User user = userRepository.findById(itemDto.getUserId())
                .orElseThrow(() -> new EntityNotFoundException("Usuário não encontrado com o id: " + itemDto.getUserId()));

        if (itemDto.getRestaurantId() != null) {
            Restaurant restaurant = restaurantRepository.findById(itemDto.getRestaurantId())
                    .orElseThrow(() -> new EntityNotFoundException("Restaurant not found with id: " + itemDto.getRestaurantId()));
            if (!restaurant.getOwner().getId().equals(itemDto.getUserId())) {
                throw new IllegalArgumentException("Usuário não é dono deste restaurante");
            }
        }

        Item item = new Item();
        item.setName(itemDto.getName());
        item.setDescription(itemDto.getDescription());
        item.setPrice(itemDto.getPrice());
        
        // Atribui imagem automaticamente baseada na categoria
        String imageId = CategoryImageMapper.getImageForCategory(itemDto.getCategory());
        String imageUrl = imageValidator.resolveImageUrl(imageId);
        System.out.println("DEBUG: Categoria=" + itemDto.getCategory() + " | ImageId=" + imageId + " | ImageUrl=" + imageUrl);
        item.setImage(imageUrl);
        
        item.setCategory(itemDto.getCategory());
        if (itemDto.getFeatured() != null) {
            item.setFeatured(itemDto.getFeatured());
        }
        item.setUser(user);
        if (itemDto.getRestaurantId() != null) {
            Restaurant restaurant = restaurantRepository.findById(itemDto.getRestaurantId())
                    .orElseThrow(() -> new EntityNotFoundException("Restaurant not found with id: " + itemDto.getRestaurantId()));
            item.setRestaurant(restaurant);
        }
        return itemRepository.save(item);
    }

    public Optional<Item> getItemById(Long itemId) {
        return itemRepository.findById(itemId);
    }

    public void deleteItem(Long itemId) {
        if (!itemRepository.existsById(itemId)) {
            throw new EntityNotFoundException("Item not found with id: " + itemId);
        }
        List<menu.q.backend.model.OrderItem> orderItems = orderItemRepository.findByItemId(itemId);
        if (!orderItems.isEmpty()) {
            throw new IllegalStateException("Cannot delete item with id " + itemId + " because it is referenced in " + orderItems.size() + " order(s)");
        }
        itemRepository.deleteById(itemId);
    }

    public Item updateItem(Long itemId, ItemDto itemDto) {
        Item item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found with id: " + itemId));

        
        // Se categoria mudou, atualiza a imagem automaticamente
        if (itemDto.getCategory() != null) {
            item.setCategory(itemDto.getCategory());
            String imageId = CategoryImageMapper.getImageForCategory(itemDto.getCategory());
            item.setImage(imageValidator.resolveImageUrl(imageId));
        }
        if (itemDto.getPrice() != null) item.setPrice(itemDto.getPrice());
        if (itemDto.getImage() != null) item.setImage(itemDto.getImage());
        if (itemDto.getCategory() != null) item.setCategory(itemDto.getCategory());
        if (itemDto.getFeatured() != null) item.setFeatured(itemDto.getFeatured());

        return itemRepository.save(item);
    }

    public List<Item> getItemsByUserId(Long userId, String name) {
        if (!userRepository.existsById(userId)) {
            throw new EntityNotFoundException("Usuário não encontrado com o id: " + userId);
        }
        List<Item> items = itemRepository.findByUserId(userId);
        if (name != null && !name.isEmpty()) {
            return items.stream()
                    .filter(item -> item.getName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
        }
        return items;
    }
}