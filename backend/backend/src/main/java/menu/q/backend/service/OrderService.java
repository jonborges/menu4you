package menu.q.backend.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

import jakarta.persistence.EntityNotFoundException;
import menu.q.backend.model.Item;
import menu.q.backend.model.Order;
import menu.q.backend.model.OrderItem;
import menu.q.backend.model.Restaurant;
import menu.q.backend.model.User;
import menu.q.backend.repository.ItemRepository;
import menu.q.backend.repository.OrderRepository;
import menu.q.backend.repository.RestaurantRepository;
import menu.q.backend.repository.UserRepository;

@Service
public class OrderService {

    // Limites de segurança para pedidos
    private static final int MAX_ITEMS_PER_ORDER = 100;
    private static final int MAX_QUANTITY_PER_ITEM = 50;

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ItemRepository itemRepository;
    private final RestaurantRepository restaurantRepository;

    public OrderService(OrderRepository orderRepository, UserRepository userRepository, ItemRepository itemRepository, RestaurantRepository restaurantRepository) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.itemRepository = itemRepository;
        this.restaurantRepository = restaurantRepository;
    }

    public Order createOrder(Long userId, Long restaurantId, Integer tableNumber, String guestName, List<OrderItemRequest> itemsReq) {
        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User not found"));
        }
        Restaurant restaurant = restaurantRepository.findById(restaurantId).orElseThrow(() -> new EntityNotFoundException("Restaurant not found"));

        // Validação: tableNumber deve estar no range válido
        if (tableNumber != null && (tableNumber < 1 || tableNumber > restaurant.getTableCount())) {
            throw new IllegalArgumentException("Número da mesa inválido. Deve ser entre 1 e " + restaurant.getTableCount());
        }

        Order order = new Order();
        order.setBuyer(user);
        order.setRestaurant(restaurant);
        order.setTableNumber(tableNumber);
        order.setGuestName(guestName); // Para pedidos sem login

        // Validação: pedido não pode estar vazio
        if (itemsReq == null || itemsReq.isEmpty()) {
            throw new IllegalArgumentException("Pedido deve conter pelo menos 1 item");
        }

        // Validação: limite de items no pedido
        if (itemsReq.size() > MAX_ITEMS_PER_ORDER) {
            throw new IllegalArgumentException("Pedido excede o limite máximo de " + MAX_ITEMS_PER_ORDER + " items");
        }
        
        BigDecimal total = BigDecimal.ZERO;
        for (OrderItemRequest ir : itemsReq) {
            // Validação: quantidade deve ser positiva
            if (ir.quantity == null || ir.quantity <= 0) {
                throw new IllegalArgumentException("Quantidade deve ser maior que zero");
            }

            // Validação: quantidade máxima por item
            if (ir.quantity > MAX_QUANTITY_PER_ITEM) {
                throw new IllegalArgumentException("Quantidade por item não pode exceder " + MAX_QUANTITY_PER_ITEM + " unidades");
            }
            
            Item item = itemRepository.findById(ir.itemId).orElseThrow(() -> new EntityNotFoundException("Item not found: " + ir.itemId));
            
            // Validação: item deve pertencer ao restaurante do pedido
            if (item.getRestaurant() != null && !item.getRestaurant().getId().equals(restaurantId)) {
                throw new IllegalArgumentException("Item " + item.getName() + " não pertence a este restaurante");
            }
            
            OrderItem oi = new OrderItem(item.getId(), item.getName(), item.getPrice(), ir.quantity);
            order.addItem(oi);
            total = total.add(item.getPrice().multiply(BigDecimal.valueOf(ir.quantity)));
        }
        order.setTotal(total);
        order.setStatus(menu.q.backend.model.OrderStatus.PENDING);

        return orderRepository.save(order);
    }

    public Order getById(Long id) {
        return orderRepository.findById(id).orElseThrow(() -> new EntityNotFoundException("Order not found"));
    }

    public List<Order> getByBuyer(Long buyerId) {
        return orderRepository.findByBuyerId(buyerId);
    }

    public List<Order> getByRestaurant(Long restaurantId) {
        return orderRepository.findByRestaurantId(restaurantId);
    }

    public void deleteOrder(Long id) {
        orderRepository.deleteById(id);
    }

    public static record OrderItemRequest(Long itemId, Integer quantity) {}
}
